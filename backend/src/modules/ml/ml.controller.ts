import { Request, Response } from 'express'
import { ejecutarEntrenamientoManual } from './ml.service.js'
export const entrenarModelo = async (req: Request, res: Response) => {
  try {
    console.log('[ML-ENDPOINT] Entrenamiento manual iniciado por admin')
    const resultado = await ejecutarEntrenamientoManual()
    res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error('[ML-ENDPOINT] Error:', error)
    res.status(500).json({ success: false, error: 'Error al entrenar el modelo' })
  }
}