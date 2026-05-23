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
      
      const usuario_id = usuario.id;  // ← Tomar el id del usuario
      const page = parseInt(req.query.page as string) || 1
      const perPage = parseInt(req.query.per_page as string) || 8

      const result = await FavoritesService.getAll(usuario_id, page, perPage)

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
      
      const usuario_id = usuario.id;
      const { inmueble_id } = req.body
      
      if (!inmueble_id) {
        return res.status(400).json({ 
          message: 'Se requiere inmueble_id en el body',
          example: { inmueble_id: 1 }
        })
      }
      
      const parsedId = parseInt(String(inmueble_id))
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      await FavoritesService.add(usuario_id, parsedId)
      
      return res.status(201).json({ 
        message: 'Inmueble agregado a favoritos',
        data: { 
          usuario_id: usuario_id, 
          inmueble_id: parsedId 
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
      
      const usuario_id = usuario.id;
      const inmueble_id = parseInt(String(req.params.inmueble_id))

      if (isNaN(inmueble_id)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      await FavoritesService.remove(usuario_id, inmueble_id)
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
      
      const usuario_id = usuario.id;
      const inmueble_id = parseInt(String(req.params.inmueble_id))

      if (isNaN(inmueble_id)) {
        return res.status(400).json({ message: 'ID de inmueble inválido' })
      }

      const isFavorite = await FavoritesService.isFavorite(usuario_id, inmueble_id)
      return res.status(200).json({ is_favorite: isFavorite })
    } catch (error) {
      console.error('Error en status:', error)
      return res.status(500).json({ message: 'Error al verificar favorito' })
    }
  }
}
