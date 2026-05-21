import { randomUUID } from 'node:crypto'
import { env } from '../../../config/env.js'
import { generateToken, type JwtPayload } from '../../../utils/jwt.js'
import {
  createGoogleLinkForUser,
  createGoogleSession,
  createGoogleUser,
  findGoogleLinkByExternalId,
  findGoogleLinkByUserId,
  findUserByGoogleEmail,
  findUserByGoogleId,
  findUserByGoogleSessionToken,
  linkGoogleToUser,
  updateGoogleLastUsage
} from './google.repository.js'
import {
  GoogleAuthError,
  type GoogleLinkSuccess,
  type GoogleLoginSuccess,
  type GoogleTokenResponse,
  type GoogleUserInfo
} from './google.types.js'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
const SESSION_DURATION_MS = 60 * 60 * 1000

type GoogleAuthMode = 'login' | 'register'

const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    })
  })

  const data = (await response.json()) as GoogleTokenResponse

  if (!response.ok || !data.access_token) {
    throw new GoogleAuthError(
      data.error_description || 'No se pudo obtener el token de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  return data
}

const getGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const data = (await response.json()) as GoogleUserInfo

  if (!response.ok || !data.email?.trim()) {
    throw new GoogleAuthError(
      'No se pudo obtener el correo de la cuenta de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  return data
}

const splitGoogleName = (fullName: string) => {
  const trimmed = fullName.trim()

  if (!trimmed) {
    return {
      nombre: '',
      apellido: ''
    }
  }

  const parts = trimmed.split(/\s+/)

  if (parts.length === 1) {
    return {
      nombre: parts[0],
      apellido: ''
    }
  }

  return {
    nombre: parts[0],
    apellido: parts.slice(1).join(' ')
  }
}

const resolveGoogleNames = (googleUser: GoogleUserInfo) => {
  const fullName = googleUser.name?.trim() || ''
  const splitName = splitGoogleName(fullName)

  const nombre = googleUser.given_name?.trim() || splitName.nombre || 'Usuario'
  const apellido = googleUser.family_name?.trim() || splitName.apellido || 'Google'

  return {
    nombre,
    apellido
  }
}

const buildGoogleSessionResponse = async (
  user: {
    id: number
    correo: string
    nombre: string
    apellido: string
    avatar?: string | null
  },
  message: string
): Promise<GoogleLoginSuccess> => {
  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS)

  await createGoogleSession({
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

const authenticateWithGoogle = async (
  code: string,
  mode: GoogleAuthMode
): Promise<GoogleLoginSuccess> => {
  if (!code?.trim()) {
    throw new GoogleAuthError('Google no devolvió un código válido.', 'GOOGLE_AUTH_FAILED', 400)
  }

  const tokenData = await exchangeCodeForTokens(code)
  const googleUser = await getGoogleUserInfo(tokenData.access_token as string)

  const googleId = googleUser.sub?.trim()
  const correo = googleUser.email?.trim().toLowerCase()

  if (!googleId || !correo) {
    throw new GoogleAuthError(
      'No se pudo obtener la información de la cuenta de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  const userByGoogleId = await findUserByGoogleId(googleId)

  if (mode === 'register') {
    if (userByGoogleId) {
      throw new GoogleAuthError(
        'Esta cuenta de Google ya está registrada. Inicia sesión con Google desde la pantalla de login.',
        'ACCOUNT_ALREADY_REGISTERED',
        409
      )
    }

    const existingUserByEmail = await findUserByGoogleEmail(correo)

    if (existingUserByEmail) {
      await linkGoogleToUser(existingUserByEmail.id, googleId, correo)

      return await buildGoogleSessionResponse(
        existingUserByEmail,
        'Google vinculado e inicio de sesión exitoso'
      )
    }

    const { nombre, apellido } = resolveGoogleNames(googleUser)

    const createdUser = await createGoogleUser(
      {
        nombre,
        apellido,
        correo,
        password: `google_${randomUUID()}`
      },
      googleId,
      correo
    )

    return await buildGoogleSessionResponse(
      createdUser,
      'Cuenta creada e inicio de sesión con Google exitoso'
    )
  }

  if (userByGoogleId) {
    await updateGoogleLastUsage(userByGoogleId.id, googleId)

    return await buildGoogleSessionResponse(userByGoogleId, 'Inicio de sesión con Google exitoso')
  }

  const existingUserByEmail = await findUserByGoogleEmail(correo)

  if (existingUserByEmail) {
    await linkGoogleToUser(existingUserByEmail.id, googleId, correo)

    return await buildGoogleSessionResponse(
      existingUserByEmail,
      'Google vinculado e inicio de sesión exitoso'
    )
  }

  throw new GoogleAuthError(
    'Esta cuenta no está registrada. Debes registrarte primero con Google.',
    'ACCOUNT_NOT_REGISTERED',
    404
  )
}

export const loginWithGoogleCodeService = async (code: string): Promise<GoogleLoginSuccess> => {
  return await authenticateWithGoogle(code, 'login')
}

export const registerWithGoogleCodeService = async (code: string): Promise<GoogleLoginSuccess> => {
  return await authenticateWithGoogle(code, 'register')
}

export const linkGoogleToCurrentUserByCodeService = async (
  sessionToken: string,
  code: string
): Promise<GoogleLinkSuccess> => {
  if (!sessionToken?.trim()) {
    throw new GoogleAuthError(
      'No se encontró la sesión activa para vincular Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  if (!code?.trim()) {
    throw new GoogleAuthError('Google no devolvió un código válido.', 'GOOGLE_AUTH_FAILED', 400)
  }

  const session = await findUserByGoogleSessionToken(sessionToken)

  if (!session?.usuario) {
    throw new GoogleAuthError(
      'Tu sesión ya no es válida. Vuelve a iniciar sesión en PropBol.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const googleUser = await getGoogleUserInfo(tokenData.access_token as string)

  const googleId = googleUser.sub?.trim()
  const correoProveedor = googleUser.email?.trim().toLowerCase() ?? null

  if (!googleId) {
    throw new GoogleAuthError(
      'No se pudo obtener el identificador de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  const existingLinkByExternalId = await findGoogleLinkByExternalId(googleId)

  if (existingLinkByExternalId && existingLinkByExternalId.usuarioId !== session.usuario.id) {
    throw new GoogleAuthError(
      'Esta cuenta de Google ya está vinculada a otro usuario.',
      'GOOGLE_AUTH_FAILED',
      409
    )
  }

  const existingLinkByUser = await findGoogleLinkByUserId(session.usuario.id)

  if (existingLinkByUser) {
    if (existingLinkByUser.idExterno === googleId) {
      return {
        message: 'Tu cuenta de Google ya estaba vinculada.',
        provider: 'google',
        linkedEmail: existingLinkByUser.correoProveedor ?? correoProveedor
      }
    }

    throw new GoogleAuthError(
      'Tu cuenta ya tiene otra cuenta de Google vinculada.',
      'GOOGLE_AUTH_FAILED',
      409
    )
  }

  await createGoogleLinkForUser({
    usuarioId: session.usuario.id,
    googleId,
    correoProveedor
  })

  return {
    message: 'Google fue vinculado correctamente.',
    provider: 'google',
    linkedEmail: correoProveedor
  }
}
