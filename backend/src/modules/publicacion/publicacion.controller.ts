import { Request, Response } from 'express'
import { eliminarPublicacionService } from './publicacion.service.js'

export const eliminarPublicacionController = async (req: Request, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioSolicitanteId = Number(req.header('x-user-id'))

  try {
    const resultado = await eliminarPublicacionService(publicacionId, usuarioSolicitanteId)

    return res.status(200).json({
      ok: true,
      message: 'Publicación eliminada correctamente',
      data: resultado
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })

        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede eliminar publicaciones de otros usuarios'
          })

        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
      }
    }

    console.error('Error al eliminar publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se puede eliminar la publicación, intente nuevamente'
    })
  }
}
