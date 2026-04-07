import { prisma } from '../../../lib/prisma.config.ts'

// Función auxiliar para redondear a 2 decimales
function redondearADos(numero: number): number {
  return Math.round(numero * 100) / 100;
}

export async function crearTransaccion(
  usuarioId: number,
  idSuscripcion: number,
) {
  // Obtener el plan de suscripción
  const plan = await prisma.plan_suscripcion.findUnique({
    where: { id: idSuscripcion },
  });
  if (!plan) throw new Error("Plan no encontrado");

  const subtotal = Number(plan.precio_plan);
  const ivaPorcentaje = 13;
  const ivaMonto = redondearADos(subtotal * (ivaPorcentaje / 100));
  const total = redondearADos(subtotal + ivaMonto);

  // Crear la transacción
  const transaccion = await prisma.transacciones.create({
    data: {
      id_usuario: usuarioId,
      id_suscripcion: idSuscripcion,
      subtotal,
      iva_porcentaje: ivaPorcentaje,
      iva_monto: ivaMonto,
      total,
      metodo_pago: "QR_BANCARIO",
      fecha_intento: new Date(),
      estado: "PENDIENTE",
      verificacion_requerida: true,
    },
  });

  // Registrar en bitácora
  await prisma.bitacora_pagos.create({
    data: {
      id_usuario: usuarioId,
      id_suscripcion: idSuscripcion,
      evento: "TRANSACCION_CREADA",
      mensaje: `Transacción creada para plan ${plan.nombre_plan}, total ${total}`,
    },
  });

  return transaccion;
}

export async function obtenerTransaccion(transaccionId: number) {
  return prisma.transacciones.findUnique({
    where: { id: transaccionId },
    include: { plan_suscripcion: true },
  });
}
