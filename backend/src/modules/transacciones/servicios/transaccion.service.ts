import { prisma } from "../../../lib/prisma.client.js";

function redondearADos(numero: number): number {
  return Math.round(numero * 100) / 100;
}

export async function crearTransaccion(
  usuarioId: number,
  idSuscripcion: number,
) {
  const plan = await prisma.plan_suscripcion.findUnique({
    where: { id: idSuscripcion },
  });
  if (!plan) throw new Error("Plan no encontrado");

  // precio_plan es el precio final con IVA incluido (ej: 99 Bs, 199 Bs)
  const total = redondearADos(Number(plan.precio_plan));
  const ivaPorcentaje = 13;
  const subtotal = redondearADos(total / (1 + ivaPorcentaje / 100));
  const ivaMonto = redondearADos(total - subtotal);

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

  await prisma.bitacora_pagos.create({
    data: {
      id_usuario: usuarioId,
      id_suscripcion: idSuscripcion,
      evento: "TRANSACCION_CREADA",
      mensaje: `Transacción creada para plan ${plan.nombre_plan}, total ${total}`,
    },
  });

  return { transaccion, plan };
}

export async function obtenerTransaccion(transaccionId: number) {
  return prisma.transacciones.findUnique({
    where: { id: transaccionId },
    include: { plan_suscripcion: true },
  });
}
