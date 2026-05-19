import { prisma } from "../../lib/prisma.client.js";

export async function ejecutarRetroalimentacion(): Promise<void> {
  console.log("[Cron] Iniciando retroalimentación automática...");
  const inicio = Date.now();

  try {
    const pendientes = await prisma.entrenamiento_ml.findMany({
      where: { retroalimentacion: null },
      select: {
        id: true,
        usuario_id: true,
        inmueble_id: true,
        fecha_evento: true,
      },
    });

    console.log(`[Cron] Registros pendientes de evaluar: ${pendientes.length}`);

    const ahora = new Date();
    let positivos = 0;
    let negativos = 0;
    let enEspera = 0;

    for (const registro of pendientes) {
      const diasDesdeEvento =
        (ahora.getTime() - new Date(registro.fecha_evento).getTime()) /
        (1000 * 3600 * 24);

      // Verificar si el usuario favoritó el inmueble
      const esFavorito = await prisma.favorito.findUnique({
        where: {
          usuarioId_inmuebleId: {
            usuarioId: registro.usuario_id,
            inmuebleId: registro.inmueble_id,
          },
        },
      });

      // Verificar si volvió a ver el inmueble (veces_visto > 1)
      const vistaRepetida = await prisma.propiedad_vista.findUnique({
        where: {
          usuarioId_inmuebleId: {
            usuarioId: registro.usuario_id,
            inmuebleId: registro.inmueble_id,
          },
        },
        select: { veces_visto: true },
      });

      const tieneAccionPositiva =
        esFavorito !== null ||
        (vistaRepetida?.veces_visto !== null &&
          (vistaRepetida?.veces_visto ?? 0) > 1);

      if (tieneAccionPositiva) {
        await prisma.entrenamiento_ml.update({
          where: { id: registro.id },
          data: { retroalimentacion: 1 },
        });
        positivos++;
      } else if (diasDesdeEvento >= 7) {
        await prisma.entrenamiento_ml.update({
          where: { id: registro.id },
          data: { retroalimentacion: 0 },
        });
        negativos++;
      } else {
        enEspera++;
      }
    }

    const tiempoTotal = Date.now() - inicio;
    console.log(
      `[Cron] Completada en ${tiempoTotal}ms — Positivos: ${positivos} | Negativos: ${negativos} | En espera: ${enEspera}`,
    );
  } catch (error) {
    console.error("[Cron] Error en retroalimentación automática:", error);
  }
}

export function iniciarCronRetroalimentacion(): void {
  console.log("[Cron] Retroalimentación automática iniciada — intervalo: 24h");

  setTimeout(() => {
    ejecutarRetroalimentacion();
  }, 10_000);

  setInterval(
    () => {
      ejecutarRetroalimentacion();
    },
    24 * 60 * 60 * 1000,
  );
}
