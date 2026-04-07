import { Request, Response } from 'express'
import { obtenerConsumo } from '../services/consumo.service.js'

export const getConsumo = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId)

    if (!userId) {
      return res.status(400).json({ message: 'userId inválido' })
    }

    const data = await obtenerConsumo(userId)

    return res.json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener consumo' })
  }
}
