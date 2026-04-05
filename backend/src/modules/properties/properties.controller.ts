import { Request, Response } from 'express'
import { propertiesService } from './properties.service.js'
import { FiltrosBusqueda } from './properties.repository'

export const propertiesController = {
  async getAll(req: Request, res: Response) {
    try {
      const { tipoInmueble, modoInmueble, query, fecha, precio, superficie } = req.query

      const filtros: FiltrosBusqueda = {
        tipoInmueble: tipoInmueble as string | string[],
        modoInmueble: modoInmueble as string | string[],
        query: query as string,
        fecha: fecha as any,
        precio: precio as any,
        superficie: superficie as any
      }

      const orden = {
        fecha: fecha as 'mas-recientes' | 'mas-populares' | undefined,
        precio: precio as 'menor-a-mayor' | 'mayor-a-menor' | undefined,
        superficie: superficie as 'menor-a-mayor' | 'mayor-a-menor' | undefined
      }

      const inmuebles = await propertiesService.getAll(filtros)

      res.json({ ok: true, data: inmuebles })
    } catch (error) {
      console.error('Error detallado:', error)
      res.status(500).json({ ok: false, message: 'Error al obtener inmuebles' })
    }
  },
  search: async (req: Request, res: Response) => {
    try {
      const { q } = req.query
      const inmuebles = await propertiesService.getAll({ query: q as string })
      res.json({ ok: true, data: inmuebles })
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error en la búsqueda rápida' })
    }
  }
}
