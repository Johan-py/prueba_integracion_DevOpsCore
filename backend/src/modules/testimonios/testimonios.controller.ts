import { Request, Response } from 'express'
import { testimoniosService } from './testimonios.service.js'

export type AuthRequest = Request & {
  user?: { id: number; correo?: string }
}

/** GET /api/testimonios?ciudad=Cochabamba */
export const listarTestimonios = async (req: Request, res: Response) => {
  try {
    const { ciudad } = req.query
    const usuarioId = (req as AuthRequest).user?.id

    const data = await testimoniosService.listar(
      ciudad as string | undefined,
      usuarioId
    )

    return res.json({ data })
  } catch (error: unknown) {
    return handleError(res, error)
  }
}

/** POST /api/testimonios/:id/like */
export const toggleLikeTestimonio = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'NOT_AUTHENTICATED' })
    }

    const testimonioId = Number(req.params.id)

    if (isNaN(testimonioId)) {
      return res.status(400).json({ message: 'ID de testimonio inválido' })
    }

    const result = await testimoniosService.toggleLike(testimonioId, req.user.id)

    return res.json(result)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'TESTIMONIO_NOT_FOUND') {
      return res.status(404).json({ message: 'Testimonio no encontrado' })
    }
    return handleError(res, error)
  }
}

function handleError(res: Response, error: unknown) {
  console.error('❌ Error:', error)
  if (error instanceof Error) {
    return res.status(500).json({ message: error.message })
  }
  return res.status(500).json({ message: 'Error interno del servidor' })
}