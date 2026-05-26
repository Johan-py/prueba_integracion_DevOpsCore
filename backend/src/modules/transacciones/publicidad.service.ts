import { prisma } from '../../lib/prisma.client.js'

// ==================== PUBLICIDAD DE PUBLICACIONES (HU-11) ====================
// Integración Cobros ↔ Publicaciones. La publicidad NO es una suscripción:
// es un pago puntual para destacar una publicación por X días.
//
// Planes de publicidad (definidos por el equipo de Publicaciones):
//   1 = Básico  → 30 días
//   2 = Premium → 60 días
// Los precios son placeholder; ajustar a los valores reales del negocio.
export const PLANES_PUBLICIDAD: Record<
  number,
  { nombre: string; dias: number; precio: number }
> = {
  1: { nombre: 'Básico', dias: 30, precio: 30 },
  2: { nombre: 'Premium', dias: 60, precio: 50 },
}

// Marca el tipo de transacción sin tocar el schema (metodo_pago es VarChar libre).
export const METODO_PUBLICIDAD = 'QR_PUBLICIDAD'
// Evento de bitácora que guarda el vínculo transacción ↔ (publicacionId, planId).
export const EVENTO_PUBLICIDAD = 'PUBLICIDAD_SOLICITADA'

const r2 = (n: number): number => Math.round(n * 100) / 100

/**
 * Crea la orden (transacción PENDIENTE) para publicitar una publicación.
 * Devuelve la referencia + QR para el flujo manual de pago.
 */
export async function crearOrdenPublicidad(
  usuarioId: number,
  publicacionId: number,
  planId: number,
) {
  const planPub = PLANES_PUBLICIDAD[planId]
  if (!planPub) throw new Error('PLAN_PUBLICIDAD_INVALIDO')

  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: { id: true, usuario_id: true, estado: true, promoted: true },
  })
  if (!publicacion) throw new Error('PUBLICACION_NO_EXISTE')
  if (publicacion.usuario_id !== usuarioId) throw new Error('NO_AUTORIZADO')
  if (publicacion.estado === 'ELIMINADA') throw new Error('PUBLICACION_YA_ELIMINADA')
  if (publicacion.promoted) throw new Error('PUBLICACION_YA_PUBLICITADA')

  // `transacciones.id_suscripcion` es FK NOT NULL a `plan_suscripcion`. Como la
  // publicidad no es una suscripción, usamos un plan existente solo para
  // satisfacer la FK; el vínculo real (publicacionId + planId) vive en
  // `bitacora_pagos` y el tipo se marca con `metodo_pago = QR_PUBLICIDAD`.
  // (Se eliminaría con una columna `publicacion_id` cuando el encargado de BD
  //  pueda migrar.)
  const planFK = await prisma.plan_suscripcion.findFirst({
    where: { eliminado_en: null },
    orderBy: { precio_plan: 'asc' },
    select: { id: true, imagen_gr_url: true },
  })
  if (!planFK) throw new Error('SIN_PLAN_PARA_QR')

  const total = r2(planPub.precio)
  const ivaPorcentaje = 13
  const subtotal = r2(total / (1 + ivaPorcentaje / 100))
  const ivaMonto = r2(total - subtotal)

  const transaccion = await prisma.transacciones.create({
    data: {
      id_usuario: usuarioId,
      id_suscripcion: planFK.id,
      subtotal,
      iva_porcentaje: ivaPorcentaje,
      iva_monto: ivaMonto,
      total,
      metodo_pago: METODO_PUBLICIDAD,
      estado: 'PENDIENTE',
      verificacion_requerida: true,
    },
  })

  await prisma.bitacora_pagos.create({
    data: {
      id_usuario: usuarioId,
      id_transaccion: transaccion.id,
      evento: EVENTO_PUBLICIDAD,
      mensaje: JSON.stringify({ publicacionId, planId }),
    },
  })

  return {
    id: transaccion.id,
    referencia: `REF-${transaccion.id}`,
    publicacionId,
    planId,
    plan: planPub.nombre,
    dias: planPub.dias,
    subtotal,
    iva_monto: ivaMonto,
    total,
    metodo_pago: METODO_PUBLICIDAD,
    estado: 'PENDIENTE',
    qrContent: planFK.imagen_gr_url ?? null,
    fecha_expiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }
}

/**
 * Si la transacción corresponde a una orden de publicidad, devuelve
 * { publicacionId, planId }; si no, devuelve null.
 */
export async function obtenerDatosPublicidad(
  transaccionId: number,
): Promise<{ publicacionId: number; planId: number } | null> {
  const evento = await prisma.bitacora_pagos.findFirst({
    where: { id_transaccion: transaccionId, evento: EVENTO_PUBLICIDAD },
    orderBy: { id: 'desc' },
  })
  if (!evento?.mensaje) return null

  try {
    const data = JSON.parse(evento.mensaje) as { publicacionId?: unknown; planId?: unknown }
    if (typeof data.publicacionId === 'number' && typeof data.planId === 'number') {
      return { publicacionId: data.publicacionId, planId: data.planId }
    }
    return null
  } catch {
    return null
  }
}

