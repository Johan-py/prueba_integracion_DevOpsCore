import type { Request, Response } from 'express'

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
    price: 9.99,
    description: 'Más publicaciones y soporte prioritario',
    tiempo: 'Por mes',
    beneficios: ['50 publicaciones', 'Soporte prioritario', 'Estadísticas básicas'],
    texto_corto: 'Para profesionales',
    popular: true
  },
  {
    id: 3,
    name: 'Pro',
    price: 19.99,
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
