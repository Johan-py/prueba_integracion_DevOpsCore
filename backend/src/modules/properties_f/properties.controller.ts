import { Request, Response } from 'express'
import { propertiesService } from './properties.service'

export const propertiesController = {
  async search(req: Request, res: Response) {
    try {
      const { categoria, tipoAccion } = req.query

      const filtros = {
        categoria,
        tipoAccion
      }

      console.log('Parámetros recibidos:', { categoria, tipoAccion })

      const properties = await propertiesService.search(filtros)

      const response = {
        ok: true,
        total: properties ? properties.length : 0,
        data: properties || []
      }

      console.log('Response enviado:', response)
      res.json(response)
    } catch (error) {
      console.error('Error en properties.controller:', error)

      const message = error instanceof Error ? error.message : 'Error desconocido'

      res.status(500).json({
        ok: false,
        total: 0,
        data: [],
        message: message
      })
    }
  }
}
