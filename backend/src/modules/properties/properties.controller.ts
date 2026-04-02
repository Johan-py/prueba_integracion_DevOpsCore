import { Request, Response } from 'express'
import { propertiesService } from './properties.service.js'

export const propertiesController = {
  async getAll(req: Request, res: Response) {
    try {
      const { fecha, precio, superficie } = req.query

      const orden = {
        fecha: fecha as 'mas-recientes' | 'mas-populares' | undefined,
        precio: precio as 'menor-a-mayor' | 'mayor-a-menor' | undefined,
        superficie: superficie as 'menor-a-mayor' | 'mayor-a-menor' | undefined
      }

      const inmuebles = await propertiesService.getAll(orden)
      res.json({ ok: true, data: inmuebles })
    } catch (error) {
      console.error('Error detallado:', error)
      res.status(500).json({ ok: false, message: 'Error al obtener inmuebles' })
    }
  },
  search: async (req: Request, res: Response) => {
    try {
      const { search } = req.query
      // Aquí iría tu lógica de Prisma para buscar en PROPBOL
      res.json({ data: [] })
    } catch (error) {
      res.status(500).json({ error: 'Error en la búsqueda' })
    }
  }
}
