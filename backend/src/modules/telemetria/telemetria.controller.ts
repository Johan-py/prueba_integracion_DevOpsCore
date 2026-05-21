import { Request, Response } from 'express'
import { TelemetriaService } from './telemetria.service.js'

const telemetriaService = new TelemetriaService()

export const trackSearch = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id || null
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const searchData = req.body

    const result = await telemetriaService.trackSearch(usuarioId, ip, searchData)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('Error tracking search:', error)
    res.status(500).json({ success: false, error: 'Error al guardar telemetría' })
  }
}

export const trackClick = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' })
    }

    const clickData = req.body
    const result = await telemetriaService.trackClick(usuarioId, clickData)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('Error tracking click:', error)
    res.status(500).json({ success: false, error: 'Error al registrar click' })
  }
}

export const getRecomendados = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;
    const ids = await telemetriaService.getRecomendados(usuarioId);
    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener recomendados' });
  }
};
