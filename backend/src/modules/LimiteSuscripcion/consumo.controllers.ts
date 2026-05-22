import type { Request, Response } from 'express'
import { obtenerConsumo } from '../../modules/LimiteSuscripcion/consumo.service.js'

export const getConsumo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const data = await obtenerConsumo(userId)

    return res.json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener consumo' })
  }
}
