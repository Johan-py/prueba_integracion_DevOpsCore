import type { Request, Response } from 'express'
import { getPropertiesMapService } from './properties.service.js'

export const getPropertiesMapController = async (_req: Request, res: Response) => {
  try {
    const result = await getPropertiesMapService()
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
