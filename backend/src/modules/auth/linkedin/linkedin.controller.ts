import type { Request, Response } from 'express'
import { env } from '../../../config/env.js'
import {
  linkLinkedInToCurrentUserByCodeService,
  loginWithLinkedInCodeService,
  registerWithLinkedInCodeService
} from './linkedin.service.js'
import { LinkedInAuthError, type LinkedInStatePayload } from './linkedin.types.js'

const encodeState = (value: LinkedInStatePayload) =>
  Buffer.from(JSON.stringify(value), 'utf-8').toString('base64url')

const decodeState = (raw: string | undefined): LinkedInStatePayload | null => {
  if (!raw?.trim()) return null
  if (raw === 'login' || raw === 'register') return { mode: raw }

  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf-8')
    ) as LinkedInStatePayload

    if (!parsed || typeof parsed !== 'object' || !('mode' in parsed)) return null

    return parsed
  } catch {
    return null
  }
}

const buildLinkedInAuthUrl = (mode: 'login' | 'register' | 'link', sessionToken?: string) => {
  const state =
    mode === 'link' ? encodeState({ mode: 'link', sessionToken: sessionToken ?? '' }) : mode

  return (
    'https://www.linkedin.com/oauth/v2/authorization?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: env.LINKEDIN_CLIENT_ID,
      redirect_uri: env.LINKEDIN_CALLBACK_URL,
      state,
      scope: 'openid profile email'
    }).toString()
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const sendPopupResponse = (
  res: Response,
  payload:
    | {
        type: 'propbol:linkedin-login-success'
        message: string
        token: string
        user: { id: number; correo: string; nombre?: string; apellido?: string }
      }
    | { type: 'propbol:linkedin-login-error'; code: string; message: string }
    | {
        type: 'propbol:social-link-success'
        provider: 'linkedin'
        message: string
        linkedEmail: string | null
      }
    | { type: 'propbol:social-link-error'; provider: 'linkedin'; code: string; message: string }
) => {
  const serializedPayload = JSON.stringify(payload).replace(/</g, '\\u003c')
  const targetOrigin = JSON.stringify(env.FRONTEND_URL)

  return res.status(200).type('html').send(`<!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><title>Autenticación con LinkedIn</title></head>
    <body>
      <p>${escapeHtml(payload.message)}</p>
      <script>
        (function () {
          const payload = ${serializedPayload};
          const targetOrigin = ${targetOrigin};
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, targetOrigin);
          }
          window.close();
        })();
      </script>
    </body>
    </html>`)
}

export const startLinkedInLoginController = (_req: Request, res: Response) => {
  return res.redirect(buildLinkedInAuthUrl('login'))
}

export const startLinkedInRegisterController = (_req: Request, res: Response) => {
  return res.redirect(buildLinkedInAuthUrl('register'))
}

export const getLinkedInLinkUrlController = (req: Request, res: Response) => {
  const authorization = req.headers.authorization ?? ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''

  if (!token) {
    return res.status(401).json({
      message: 'No se encontró una sesión válida para vincular LinkedIn.'
    })
  }

  return res.status(200).json({ url: buildLinkedInAuthUrl('link', token) })
}

export const linkedInCallbackController = async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : ''
  const error = typeof req.query.error === 'string' ? req.query.error : ''
  const state = decodeState(typeof req.query.state === 'string' ? req.query.state : '')

  if (error) {
    if (state?.mode === 'link') {
      return sendPopupResponse(res, {
        type: 'propbol:social-link-error',
        provider: 'linkedin',
        code: 'LINKEDIN_AUTH_FAILED',
        message: 'La vinculación con LinkedIn fue cancelada o falló.'
      })
    }

    return sendPopupResponse(res, {
      type: 'propbol:linkedin-login-error',
      code: 'LINKEDIN_AUTH_FAILED',
      message: 'La autenticación con LinkedIn fue cancelada o falló.'
    })
  }

  if (!code) {
    if (state?.mode === 'link') {
      return sendPopupResponse(res, {
        type: 'propbol:social-link-error',
        provider: 'linkedin',
        code: 'LINKEDIN_AUTH_FAILED',
        message: 'LinkedIn no devolvió un código válido.'
      })
    }

    return sendPopupResponse(res, {
      type: 'propbol:linkedin-login-error',
      code: 'LINKEDIN_AUTH_FAILED',
      message: 'LinkedIn no devolvió un código válido.'
    })
  }

  try {
    if (state?.mode === 'link') {
      const result = await linkLinkedInToCurrentUserByCodeService(state.sessionToken ?? '', code)

      return sendPopupResponse(res, {
        type: 'propbol:social-link-success',
        provider: 'linkedin',
        message: result.message,
        linkedEmail: result.linkedEmail
      })
    }

    const mode = state?.mode === 'register' ? 'register' : 'login'

    const result =
      mode === 'register'
        ? await registerWithLinkedInCodeService(code)
        : await loginWithLinkedInCodeService(code)

    return sendPopupResponse(res, {
      type: 'propbol:linkedin-login-success',
      message: result.message,
      token: result.token,
      user: result.user
    })
  } catch (err) {
    console.error('[LinkedIn Auth Error]', err)

    if (err instanceof LinkedInAuthError) {
      if (state?.mode === 'link') {
        return sendPopupResponse(res, {
          type: 'propbol:social-link-error',
          provider: 'linkedin',
          code: err.code,
          message: err.message
        })
      }

      return sendPopupResponse(res, {
        type: 'propbol:linkedin-login-error',
        code: err.code,
        message: err.message
      })
    }

    if (state?.mode === 'link') {
      return sendPopupResponse(res, {
        type: 'propbol:social-link-error',
        provider: 'linkedin',
        code: 'LINKEDIN_AUTH_FAILED',
        message: 'No se pudo completar la vinculación con LinkedIn.'
      })
    }

    return sendPopupResponse(res, {
      type: 'propbol:linkedin-login-error',
      code: 'LINKEDIN_AUTH_FAILED',
      message: 'No se pudo completar el inicio de sesión con LinkedIn.'
    })
  }
}
