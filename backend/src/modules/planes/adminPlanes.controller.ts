import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

const toMessage = (e: unknown) => (e instanceof Error ? e.message : 'Error interno')

export const listarPlanes = async (_req: Request, res: Response) => {
  try {
    const planes = await prisma.plan_suscripcion.findMany({ orderBy: { id: 'asc' } })
    return res.json(
      planes.map((p) => ({
        id: p.id,
        nombre_plan: p.nombre_plan,
        descripcion_plan: p.descripcion_plan,
        precio_plan: Number(p.precio_plan),
        duracion_plan_dias: p.duracion_plan_dias,
        nro_publicaciones_plan: p.nro_publicaciones_plan,
        imagen_gr_url: p.imagen_gr_url,
      }))
    )
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const crearPlan = async (req: Request, res: Response) => {
  try {
    const { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url } = req.body
    if (!nombre_plan || precio_plan === undefined || precio_plan === null) {
      return res.status(400).json({ error: 'nombre_plan y precio_plan son requeridos' })
    }
    if (Number(precio_plan) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }
    const plan = await prisma.plan_suscripcion.create({
      data: { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url },
    })
    return res.status(201).json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      descripcion_plan: plan.descripcion_plan,
      precio_plan: Number(plan.precio_plan),
      duracion_plan_dias: plan.duracion_plan_dias,
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const actualizarPlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url } = req.body
    if (precio_plan !== undefined && Number(precio_plan) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }
    const plan = await prisma.plan_suscripcion.update({
      where: { id },
      data: { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url },
    })
    return res.json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      descripcion_plan: plan.descripcion_plan,
      precio_plan: Number(plan.precio_plan),
      duracion_plan_dias: plan.duracion_plan_dias,
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const eliminarPlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const activas = await prisma.suscripciones_activas.count({
      where: { id_suscripcion: id, estado: 'ACTIVA' },
    })
    if (activas > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: el plan tiene suscripciones activas' })
    }

    await prisma.plan_suscripcion.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}
