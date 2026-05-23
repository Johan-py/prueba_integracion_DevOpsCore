import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

export const getPlanes = async (_req: Request, res: Response) => {
  try {
    // Lee de la BD real, excluyendo planes eliminados lógicamente (soft delete HU-10).
    // Así los cambios del admin (crear/editar/eliminar) se reflejan en el catálogo del usuario.
    const planes = await prisma.plan_suscripcion.findMany({
      where: { eliminado_en: null },
      orderBy: { precio_plan: 'asc' },
    })

    // HU-01: no mostrar planes con precio nulo, negativo o inválido.
    const validos = planes.filter(
      (p) => p.precio_plan !== null && Number(p.precio_plan) >= 0 && !Number.isNaN(Number(p.precio_plan))
    )

    const data = validos.map((p, idx) => ({
      id: p.id,
      name: p.nombre_plan ?? 'Plan',
      price: Number(p.precio_plan),
      description: p.descripcion_plan ?? '',
      benefits: [
        p.nro_publicaciones_plan != null ? `${p.nro_publicaciones_plan} publicaciones activas` : null,
        p.duracion_plan_dias != null ? `${p.duracion_plan_dias} días de vigencia` : null,
      ].filter((b): b is string => Boolean(b)),
      imagen_gr_url: p.imagen_gr_url,
      // Marca como "más popular" al plan intermedio cuando hay 3 o más planes.
      popular: validos.length >= 3 && idx === 1,
    }))

    res.json(data)
  } catch {
    res.status(500).json({
      error: 'Error del servidor',
      message: 'No se pudieron cargar los planes',
    })
  }
}

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const plan = await prisma.plan_suscripcion.findUnique({ where: { id } })
    if (!plan || plan.eliminado_en) return res.status(404).json({ error: 'Plan no encontrado' })

    return res.json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      precio_plan: Number(plan.precio_plan),
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      duracion_plan_dias: plan.duracion_plan_dias,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno',
    })
  }
}

