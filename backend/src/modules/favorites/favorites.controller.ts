import { Request, Response } from 'express'
import { FavoritesService } from './favorites.service.js'
import { AuthRequest } from '../../middleware/validarJWT.js'  // Importar el tipo

export class FavoritesController {

  static async getAll(req: AuthRequest, res: Response) {  // ← Usar AuthRequest
    try {
      const usuario = req.usuario;  // ← Viene de validarJWT
      
      if (!usuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      const usuarioId = usuario.id;  // ← Tomar el id del usuario
      const page = parseInt(req.query.page as string) || 1
      const perPage = parseInt(req.query.per_page as string) || 8

      const result = await FavoritesService.getAll(usuarioId, page, perPage)

      if (result.total === 0) {
        return res.status(200).json({
          ...result,
          message: 'Aún no tienes propiedades favoritas',
        })
      }

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error en getAll:', error)
      return res.status(500).json({ message: 'Error al obtener favoritos' })
    }
  }

  static async add(req: AuthRequest, res: Response) {  // ← Usar AuthRequest
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      const usuarioId = usuario.id;
      const { inmuebleId } = req.body
      
      if (!inmuebleId) {
        return res.status(400).json({ 
          message: 'Se requiere inmuebleId en el body',
          example: { inmuebleId: 1 }
        })
      }
      
      const parsedId = parseInt(String(inmuebleId))
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      await FavoritesService.add(usuarioId, parsedId)
      
      return res.status(201).json({ 
        message: 'Inmueble agregado a favoritos',
        data: { 
          usuarioId: usuarioId, 
          inmuebleId: parsedId 
        }
      })
    } catch (error: any) {
      if (error.message === 'ALREADY_EXISTS') {
        return res.status(409).json({ message: 'El inmueble ya está en favoritos' })
      }
      console.error('Error en add:', error)
      return res.status(500).json({ message: 'Error al agregar favorito' })
    }
  }

  static async remove(req: AuthRequest, res: Response) {  // ← Usar AuthRequest
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      const usuarioId = usuario.id;
      const inmuebleId = parseInt(String(req.params.inmuebleId))

      if (isNaN(inmuebleId)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      await FavoritesService.remove(usuarioId, inmuebleId)
      return res.status(200).json({ message: 'Inmueble eliminado de favoritos' })
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'El inmueble no estaba en favoritos' })
      }
      console.error('Error en remove:', error)
      return res.status(500).json({ message: 'Error al eliminar favorito' })
    }
  }

  static async status(req: AuthRequest, res: Response) {  // ← Usar AuthRequest
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      const usuarioId = usuario.id;
      const inmuebleId = parseInt(String(req.params.inmuebleId))

      if (isNaN(inmuebleId)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      const isFavorite = await FavoritesService.isFavorite(usuarioId, inmuebleId)
      return res.status(200).json({ is_favorite: isFavorite })
    } catch (error) {
      console.error('Error en status:', error)
      return res.status(500).json({ message: 'Error al verificar favorito' })
    }
  }
}