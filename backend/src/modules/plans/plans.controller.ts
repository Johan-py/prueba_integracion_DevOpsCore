import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

const planes = [
  {
    id: 1,
    name: 'Básico',
    price: 0,
    description: 'Publicaciones gratuitas limitadas',
    tiempo: 'Por mes',
    beneficios: ['10 publicaciones', 'Soporte básico'],
    texto_corto: 'Ideal para empezar'
  },
  {
    id: 2,
    name: 'Estándar',
    price: 99,
    description: 'Más publicaciones y soporte prioritario',
    tiempo: 'Por mes',
    beneficios: ['50 publicaciones', 'Soporte prioritario', 'Estadísticas básicas'],
    texto_corto: 'Para profesionales',
    popular: true
  },
  {
    id: 3,
    name: 'Pro',
    price: 199,
    description: 'Publicaciones ilimitadas + estadísticas avanzadas',
    tiempo: 'Por mes',
    beneficios: [
      'Publicaciones ilimitadas',
      'Soporte 24/7',
      'Estadísticas avanzadas',
      'API acceso'
    ],
    texto_corto: 'Para empresas'
  }
]

export const getPlanes = async (req: Request, res: Response) => {
  try {
    const planesValidos = planes.filter(
      (plan) => plan.price !== null && plan.price !== undefined && plan.price >= 0
    )
    res.json(planesValidos)
  } catch {
    res.status(500).json({
      error: 'Error del servidor',
      message: 'No se pudieron cargar los planes'
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
