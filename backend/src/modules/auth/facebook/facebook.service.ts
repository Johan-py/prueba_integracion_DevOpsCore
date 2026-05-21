import { randomUUID } from 'node:crypto'
import { env } from '../../../config/env.js'
import { generateToken, type JwtPayload } from '../../../utils/jwt.js'
import {
  createFacebookSession,
  createFacebookUser,
  findUserByFacebookEmail,
  findUserByFacebookId,
  linkFacebookToUser,
  updateFacebookLastUsage
} from './facebook.repository.js'
import {
  FacebookAuthError,
  type FacebookLoginSuccess,
  type FacebookTokenResponse,
  type FacebookUserInfo
} from './facebook.types.js'

import {
  createFacebookLinkForUser,
  findFacebookLinkByExternalId,
  findFacebookLinkByUserId,
  findUserByFacebookSessionToken
} from './facebook.repository.js'
import type { FacebookLinkSuccess } from './facebook.types.js'

const FACEBOOK_GRAPH_BASE_URL = 'https://graph.facebook.com/v25.0'
const FACEBOOK_TOKEN_URL = `${FACEBOOK_GRAPH_BASE_URL}/oauth/access_token`
const FACEBOOK_USERINFO_URL = `${FACEBOOK_GRAPH_BASE_URL}/me`
const SESSION_DURATION_MS = 60 * 60 * 1000

type FacebookAuthMode = 'login' | 'register'

const exchangeCodeForTokens = async (code: string) => {
  const url = new URL(FACEBOOK_TOKEN_URL)

  url.searchParams.set('client_id', env.FACEBOOK_CLIENT_ID)
  url.searchParams.set('client_secret', env.FACEBOOK_CLIENT_SECRET)
  url.searchParams.set('redirect_uri', env.FACEBOOK_CALLBACK_URL)
  url.searchParams.set('code', code)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  const data = (await response.json()) as FacebookTokenResponse

  if (!response.ok || !data.access_token) {
    throw new FacebookAuthError(
      data.error?.message || 'No se pudo obtener el token de Facebook.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  return data
}

const getFacebookUserInfo = async (accessToken: string) => {
  const url = new URL(FACEBOOK_USERINFO_URL)

  url.searchParams.set('fields', 'id,name,email,first_name,last_name')
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  const data = (await response.json()) as FacebookUserInfo & {
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new FacebookAuthError(
      data.error?.message || 'No se pudo obtener la información de Facebook.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  return data
}

const resolveFacebookNames = (facebookUser: FacebookUserInfo) => {
  const nombre =
    facebookUser.first_name?.trim() || facebookUser.name?.trim().split(/\s+/)[0] || 'Usuario'

  const apellido =
    facebookUser.last_name?.trim() ||
    facebookUser.name?.trim().split(/\s+/).slice(1).join(' ') ||
    'Facebook'

  return { nombre, apellido }
}

const buildFacebookSessionResponse = async (
  user: {
    id: number
    correo: string
    nombre: string
    apellido: string
    avatar?: string | null
  },
  message: string
): Promise<FacebookLoginSuccess> => {
  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS)

  await createFacebookSession({
    token,
    usuarioId: user.id,
    fechaExpiracion
  })

  return {
    message,
    token,
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      avatar: user.avatar
    }
  }
}

const authenticateWithFacebook = async (
  code: string,
  mode: FacebookAuthMode
): Promise<FacebookLoginSuccess> => {
  if (!code?.trim()) {
    throw new FacebookAuthError(
      'Facebook no devolvió un código válido.',
      'FACEBOOK_AUTH_FAILED',
      400
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const facebookUser = await getFacebookUserInfo(tokenData.access_token as string)

  const facebookId = facebookUser.id?.trim()
  const correo = facebookUser.email?.trim().toLowerCase() || null

  if (!facebookId) {
    throw new FacebookAuthError(
      'No se pudo obtener el identificador de la cuenta de Facebook.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  const userByFacebookId = await findUserByFacebookId(facebookId)

  if (mode === 'register') {
    if (userByFacebookId) {
      throw new FacebookAuthError(
        'Esta cuenta de Facebook ya está registrada. Inicia sesión con Facebook desde la pantalla de login.',
        'ACCOUNT_ALREADY_REGISTERED',
        409
      )
    }

    if (!correo) {
      throw new FacebookAuthError(
        'No se pudo crear la cuenta porque Facebook no devolvió un correo. Crea tu cuenta manualmente y luego vincula Facebook desde Seguridad.',
        'FACEBOOK_AUTH_FAILED',
        401
      )
    }

    const existingUserByEmail = await findUserByFacebookEmail(correo)

    if (existingUserByEmail) {
      await linkFacebookToUser(existingUserByEmail.id, facebookId, correo)

      return await buildFacebookSessionResponse(
        existingUserByEmail,
        'Facebook vinculado e inicio de sesión exitoso'
      )
    }

    const { nombre, apellido } = resolveFacebookNames(facebookUser)

    const createdUser = await createFacebookUser(
      {
        nombre,
        apellido,
        correo,
        password: `facebook_${randomUUID()}`
      },
      facebookId,
      correo
    )

    return await buildFacebookSessionResponse(
      createdUser,
      'Cuenta creada e inicio de sesión con Facebook exitoso'
    )
  }

  if (userByFacebookId) {
    await updateFacebookLastUsage(userByFacebookId.id, facebookId)

    return await buildFacebookSessionResponse(
      userByFacebookId,
      'Inicio de sesión con Facebook exitoso'
    )
  }

  if (!correo) {
    throw new FacebookAuthError(
      'Esta cuenta de Facebook no está vinculada. Inicia sesión manualmente y vincúlala desde Seguridad.',
      'ACCOUNT_NOT_REGISTERED',
      404
    )
  }

  const existingUserByEmail = await findUserByFacebookEmail(correo)

  if (existingUserByEmail) {
    await linkFacebookToUser(existingUserByEmail.id, facebookId, correo)

    return await buildFacebookSessionResponse(
      existingUserByEmail,
      'Facebook vinculado e inicio de sesión exitoso'
    )
  }

  throw new FacebookAuthError(
    'Esta cuenta no está registrada. Debes registrarte primero con Facebook.',
    'ACCOUNT_NOT_REGISTERED',
    404
  )
}

export const loginWithFacebookCodeService = async (code: string): Promise<FacebookLoginSuccess> => {
  return await authenticateWithFacebook(code, 'login')
}

export const registerWithFacebookCodeService = async (
  code: string
): Promise<FacebookLoginSuccess> => {
  return await authenticateWithFacebook(code, 'register')
}

export const linkFacebookToCurrentUserByCodeService = async (
  sessionToken: string,
  code: string
): Promise<FacebookLinkSuccess> => {
  if (!sessionToken?.trim()) {
    throw new FacebookAuthError(
      'No se encontró la sesión activa para vincular Facebook.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  if (!code?.trim()) {
    throw new FacebookAuthError(
      'Facebook no devolvió un código válido.',
      'FACEBOOK_AUTH_FAILED',
      400
    )
  }

  const session = await findUserByFacebookSessionToken(sessionToken)

  if (!session?.usuario) {
    throw new FacebookAuthError(
      'Tu sesión ya no es válida. Vuelve a iniciar sesión en PropBol.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const facebookUser = await getFacebookUserInfo(tokenData.access_token as string)

  const facebookId = facebookUser.id?.trim()
  const correoProveedor = facebookUser.email?.trim().toLowerCase() ?? null

  if (!facebookId) {
    throw new FacebookAuthError(
      'No se pudo obtener el identificador de Facebook.',
      'FACEBOOK_AUTH_FAILED',
      401
    )
  }

  const existingLinkByExternalId = await findFacebookLinkByExternalId(facebookId)

  if (existingLinkByExternalId && existingLinkByExternalId.usuarioId !== session.usuario.id) {
    throw new FacebookAuthError(
      'Esta cuenta de Facebook ya está vinculada a otro usuario.',
      'FACEBOOK_AUTH_FAILED',
      409
    )
  }

  const existingLinkByUser = await findFacebookLinkByUserId(session.usuario.id)

  if (existingLinkByUser) {
    if (existingLinkByUser.idExterno === facebookId) {
      return {
        message: 'Tu cuenta de Facebook ya estaba vinculada.',
        provider: 'facebook',
        linkedEmail: existingLinkByUser.correoProveedor ?? correoProveedor
      }
    }

    throw new FacebookAuthError(
      'Tu cuenta ya tiene otra cuenta de Facebook vinculada.',
      'FACEBOOK_AUTH_FAILED',
      409
    )
  }

  await createFacebookLinkForUser({
    usuarioId: session.usuario.id,
    facebookId,
    correoProveedor
  })

  return {
    message: 'Facebook fue vinculado correctamente.',
    provider: 'facebook',
    linkedEmail: correoProveedor
  }
}
