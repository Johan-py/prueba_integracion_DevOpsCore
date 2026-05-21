import type { Request, Response } from 'express'
import { estadisticasZonaService } from './estadisticas-zona.service.js'
import type { TipoOperacion } from './estadisticas-zona.service.js'

const TIPOS_ACCION_VALIDOS: TipoOperacion[] = ['VENTA', 'ALQUILER', 'ANTICRETO']

export class EstadisticasZonaController {
  /**
   * GET /api/estadisticas-zona?zonaId=1&tipoOperacion=VENTA
   * Retorna estadísticas de precios para una zona y tipo de operación.
   */
  static async getEstadisticas(req: Request, res: Response) {
    try {
      const { zonaId, tipoOperacion } = req.query

      // --- Validaciones (CA 6): Ambos filtros son obligatorios ---
      if (!zonaId || !tipoOperacion) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debes proporcionar una zona y un tipo de operación para consultar las estadísticas.'
        })
      }

      const zonaIdNum = Number(zonaId)
      if (Number.isNaN(zonaIdNum) || zonaIdNum <= 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El identificador de zona no es válido.'
        })
      }

      const tipoUpper = String(tipoOperacion).toUpperCase() as TipoOperacion
      if (!TIPOS_ACCION_VALIDOS.includes(tipoUpper)) {
        return res.status(400).json({
          ok: false,
          mensaje: `El tipo de operación no es válido. Debe ser uno de: ${TIPOS_ACCION_VALIDOS.join(', ')}.`
        })
      }

      const estadisticas = await estadisticasZonaService.getEstadisticas({
        zonaId: zonaIdNum,
        tipoOperacion: tipoUpper
      })

      return res.status(200).json({ ok: true, data: estadisticas })
    } catch (error) {
      if (error instanceof Error) {
        // CA 4: Si no existen propiedades suficientes en la zona
        if (error.message === 'SIN_DATOS_SUFICIENTES') {
          return res.status(200).json({
            ok: false,
            sinDatos: true,
            mensaje: 'No hay datos suficientes para esta zona y tipo de operación.'
          })
        }
        if (error.message === 'ZONA_NO_EXISTE') {
          return res.status(404).json({
            ok: false,
            mensaje: 'La zona seleccionada no existe.'
          })
        }
      }

      console.error('[EstadisticasZona] Error inesperado:', error)
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al calcular las estadísticas. Intenta nuevamente.'
      })
    }
  }

  /**
   * GET /api/estadisticas-zona/zonas
   * Lista las zonas disponibles para búsqueda.
   */
  static async getZonas(req: Request, res: Response) {
    try {
      const zonas = await estadisticasZonaService.getZonas()
      return res.status(200).json({ ok: true, data: zonas })
    } catch (error) {
      console.error('[EstadisticasZona] Error al obtener zonas:', error)
      return res.status(500).json({ ok: false, mensaje: 'Error al obtener las zonas.' })
    }
  }
}
