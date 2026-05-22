import type { Request, Response } from 'express'
import { getSocialLinksService, unlinkSocialProviderService } from './social-links.service.js'

export const getSocialLinksController = async (req: Request, res: Response) => {
  const usuarioId = req.user?.id

  if (!usuarioId) {
    return res.status(401).json({
      message: 'No autorizado.'
    })
  }

  const data = await getSocialLinksService(usuarioId)

  return res.status(200).json(data)
}

export const unlinkSocialProviderController = async (req: Request, res: Response) => {
  const usuarioId = req.user?.id
  const rawProvider = req.params.provider
  const provider = Array.isArray(rawProvider) ? rawProvider[0] : rawProvider

  if (!usuarioId) {
    return res.status(401).json({
      message: 'No autorizado.'
    })
  }

  if (!provider) {
    return res.status(400).json({
      message: 'Proveedor inválido.'
    })
  }
  const authHeader = req.headers.authorization
  const currentToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!currentToken) {
    return res.status(401).json({
      message: 'Token no proporcionado.'
    })
  }

  const result = await unlinkSocialProviderService(usuarioId, provider, currentToken)

  return res.status(200).json(result)
}

export const getLinkedInOriginalEmailController = async (req: Request, res: Response) => {
  const usuarioId = req.user?.id

  if (!usuarioId) {
    return res.status(401).json({ message: 'No autorizado.' })
  }

  const { getLinkedInOriginalEmail } = await import('./social-links.service.js')
  const email = await getLinkedInOriginalEmail(usuarioId)

  return res.status(200).json({ linkedinOriginalEmail: email })
}
