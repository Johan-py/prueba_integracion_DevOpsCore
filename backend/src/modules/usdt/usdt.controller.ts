import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { convertirBobAUsdt, getExchangeRate, verificarTransaccionShasta } from './usdt.service.js'
import { emitirComprobante } from '../transacciones/servicios/comprobanteService.js'
import { createNotificationService } from '../notificaciones/notificaciones.service.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

const toMessage = (e: unknown) => (e instanceof Error ? e.message : 'Error interno')

export const crearPagoUsdt = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id
    if (!usuarioId) return res.status(401).json({ error: 'No autenticado' })

    const { transaccionId } = req.body
    if (!transaccionId) return res.status(400).json({ error: 'Falta transaccionId' })

    const transaccion = await prisma.transacciones.findUnique({
      where: { id: parseInt(String(transaccionId)) },
      include: { plan_suscripcion: true },
    })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.id_usuario !== usuarioId) return res.status(403).json({ error: 'Sin permiso' })
    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(409).json({ error: 'La transacción ya no está pendiente' })
    }

    await prisma.transacciones.update({
      where: { id: transaccion.id },
      data: { metodo_pago: 'USDT_TRC20' },
    })

    const totalBob = Number(transaccion.total)
    const { bob_per_usdt } = getExchangeRate()
    const totalUsdt = convertirBobAUsdt(totalBob)
    const walletAddress = process.env.TRON_WALLET_ADDRESS ?? ''
    const fechaExpiracion = new Date(
      (transaccion.fecha_intento?.getTime() ?? Date.now()) + 30 * 60 * 1000
    )

    return res.json({
      id: transaccion.id,
      walletAddress,
      totalBob,
      totalUsdt,
      bob_per_usdt,
      red: 'Shasta Testnet',
      token: 'USDT (TRC20)',
      fechaExpiracion: fechaExpiracion.toISOString(),
      referencia: `PAY-${transaccion.id}`,
      planNombre: transaccion.plan_suscripcion?.nombre_plan ?? '—',
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const verificarPagoUsdt = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { txHash } = req.body
    if (!txHash?.trim()) return res.status(400).json({ error: 'Falta el hash de la transacción (TX ID)' })

    const transaccion = await prisma.transacciones.findUnique({
      where: { id },
      include: {
        usuario: { select: { correo: true, nombre: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
    })

    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.metodo_pago !== 'USDT_TRC20') {
      return res.status(400).json({ error: 'Esta transacción no corresponde a un pago USDT' })
    }
    if (transaccion.estado === 'COMPLETADO') {
      return res.json({ ok: true, mensaje: 'Pago ya confirmado anteriormente' })
    }
    if (transaccion.estado === 'CANCELADO') {
      return res.status(400).json({ error: 'Esta orden fue cancelada. Genera una nueva.' })
    }

    const fechaExpiracion = new Date(
      (transaccion.fecha_intento?.getTime() ?? Date.now()) + 30 * 60 * 1000
    )
    if (Date.now() > fechaExpiracion.getTime()) {
      await prisma.transacciones.update({ where: { id }, data: { estado: 'CANCELADO' } })
      return res.status(400).json({ error: 'Tiempo de pago expirado. Genera una nueva orden.' })
    }

    const resultado = await verificarTransaccionShasta(txHash.trim())

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_transaccion: id,
        evento: resultado.valida ? 'USDT_VERIFICADO_OK' : 'USDT_VERIFICADO_FALLO',
        mensaje: `Hash: ${txHash} | ${resultado.mensaje}`,
      },
    })

    if (!resultado.valida) {
      return res.status(400).json({ ok: false, mensaje: resultado.mensaje })
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario!,
        id_suscripcion: transaccion.id_suscripcion!,
        id_transaccion: id,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA',
      },
    })

    try {
      await emitirComprobante(id)
    } catch { /* no bloquea el flujo */ }

    try {
      await createNotificationService({
        correo: transaccion.usuario.correo,
        titulo: '¡Tu pago USDT fue verificado!',
        mensaje: `Tu pago del plan ${transaccion.plan_suscripcion?.nombre_plan ?? '—'} fue verificado on-chain. Tu suscripción ya está activa.`,
      })
    } catch { /* no bloquea el flujo */ }

    return res.json({
      ok: true,
      mensaje: resultado.mensaje,
      confirmaciones: resultado.confirmaciones,
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const obtenerTipoCambio = (_req: Request, res: Response) => {
  const { bob_per_usdt } = getExchangeRate()
  const walletAddress = process.env.TRON_WALLET_ADDRESS ?? ''
  const red = process.env.TRON_NETWORK === 'shasta' ? 'Shasta Testnet' : 'Mainnet'
  return res.json({ bob_per_usdt, walletAddress, red })
}
