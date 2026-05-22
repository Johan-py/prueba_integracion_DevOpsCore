import { randomUUID } from 'node:crypto'
import { env } from '../../../config/env.js'
import { generateToken, type JwtPayload } from '../../../utils/jwt.js'
import { enviarCorreoBienvenidaLinkedIn } from '../../../lib/email.service.js'
import {
  createLinkedInLinkForUser,
  createLinkedInSession,
  createLinkedInUser,
  findLinkedInLinkByExternalId,
  findLinkedInLinkByUserId,
  findUserByLinkedInEmail,
  findUserByLinkedInId,
  findUserByLinkedInSessionToken,
  linkLinkedInToUser,
  updateLinkedInLastUsage
} from './linkedin.repository.js'
import {
  LinkedInAuthError,
  type LinkedInLinkSuccess,
  type LinkedInLoginSuccess,
  type LinkedInTokenResponse,
  type LinkedInUserInfo
} from './linkedin.types.js'
import { encryptLinkedInAccessToken } from './linkedin-token-crypto.js'

const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'
const SESSION_DURATION_MS = 60 * 60 * 1000

const buildLinkedInTokenStorage = (tokenData: LinkedInTokenResponse) => {
  if (!tokenData.access_token) {
    throw new LinkedInAuthError(
      'No se pudo obtener el token de acceso de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  const tokenExpiresAt =
    typeof tokenData.expires_in === 'number'
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null

  return {
    encryptedAccessToken: encryptLinkedInAccessToken(tokenData.access_token),
    tokenExpiresAt
  }
}

const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: env.LINKEDIN_CALLBACK_URL,
      grant_type: 'authorization_code'
    })
  })

  if (response.status === 429) {
    throw new LinkedInAuthError(
      'LinkedIn está experimentando un alto volumen de solicitudes. Por favor, intenta nuevamente en unos momentos.',
      'LINKEDIN_RATE_LIMIT',
      429
    )
  }

  const data = (await response.json()) as LinkedInTokenResponse

  if (!response.ok || !data.access_token) {
    throw new LinkedInAuthError(
      data.error_description || 'No se pudo obtener el token de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  return data
}

const getLinkedInUserInfo = async (accessToken: string) => {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (response.status === 429) {
    throw new LinkedInAuthError(
      'LinkedIn está experimentando un alto volumen de solicitudes. Por favor, intenta nuevamente en unos momentos.',
      'LINKEDIN_RATE_LIMIT',
      429
    )
  }

  const data = (await response.json()) as LinkedInUserInfo

  if (response.status === 401 || response.status === 403) {
    throw new LinkedInAuthError(
      'PropBol ya no tiene acceso a tu cuenta de LinkedIn. Por favor, autoriza nuevamente.',
      'LINKEDIN_REVOKED',
      401
    )
  }

  if (!response.ok || !data.email?.trim()) {
    throw new LinkedInAuthError(
      'No se pudo obtener el correo de la cuenta de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  return data
}

const buildLinkedInSessionResponse = async (
  user: {
    id: number
    correo: string
    nombre: string
    apellido: string
    avatar?: string | null
  },
  message: string
): Promise<LinkedInLoginSuccess> => {
  const jwtPayload: JwtPayload = { id: user.id, correo: user.correo }
  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS)

  await createLinkedInSession({ token, usuarioId: user.id, fechaExpiracion })

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

export const loginWithLinkedInCodeService = async (code: string): Promise<LinkedInLoginSuccess> => {
  if (!code?.trim()) {
    throw new LinkedInAuthError(
      'LinkedIn no devolvió un código válido.',
      'LINKEDIN_AUTH_FAILED',
      400
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const linkedinUser = await getLinkedInUserInfo(tokenData.access_token!)
  const tokenStorage = buildLinkedInTokenStorage(tokenData)

  const linkedinId = linkedinUser.sub?.trim()
  const correo = linkedinUser.email?.trim().toLowerCase()

  if (!linkedinId || !correo) {
    throw new LinkedInAuthError(
      'No se pudo obtener la información de la cuenta de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  const userByLinkedInId = await findUserByLinkedInId(linkedinId)

  if (userByLinkedInId) {
    if (userByLinkedInId.activo === false) {
      throw new LinkedInAuthError('Esta cuenta está desactivada', 'ACCOUNT_DEACTIVATED', 403)
    }

    await updateLinkedInLastUsage(userByLinkedInId.id, linkedinId, tokenStorage)

    return await buildLinkedInSessionResponse(
      userByLinkedInId,
      'Inicio de sesión con LinkedIn exitoso'
    )
  }

  const existingUserByEmail = await findUserByLinkedInEmail(correo)

  if (existingUserByEmail) {
    if (existingUserByEmail.activo === false) {
      throw new LinkedInAuthError('Esta cuenta está desactivada', 'ACCOUNT_DEACTIVATED', 403)
    }

    throw new LinkedInAuthError(
      'No existe una cuenta asociada a LinkedIn. Inicia sesión con otro método y vincula LinkedIn desde Seguridad.',
      'LINKEDIN_NOT_LINKED',
      404
    )
  }

  throw new LinkedInAuthError(
    'No existe una cuenta registrada con este perfil de LinkedIn. Debes registrarte primero.',
    'ACCOUNT_NOT_REGISTERED',
    404
  )
}

export const linkLinkedInToCurrentUserByCodeService = async (
  sessionToken: string,
  code: string
): Promise<LinkedInLinkSuccess> => {
  if (!sessionToken?.trim()) {
    throw new LinkedInAuthError(
      'No se encontró la sesión activa para vincular LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  if (!code?.trim()) {
    throw new LinkedInAuthError(
      'LinkedIn no devolvió un código válido.',
      'LINKEDIN_AUTH_FAILED',
      400
    )
  }

  const session = await findUserByLinkedInSessionToken(sessionToken)

  if (!session?.usuario) {
    throw new LinkedInAuthError(
      'Tu sesión ya no es válida. Vuelve a iniciar sesión en PropBol.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const linkedinUser = await getLinkedInUserInfo(tokenData.access_token!)
  const tokenStorage = buildLinkedInTokenStorage(tokenData)

  const linkedinId = linkedinUser.sub?.trim()
  const correoProveedor = linkedinUser.email?.trim().toLowerCase() ?? null

  if (!linkedinId) {
    throw new LinkedInAuthError(
      'No se pudo obtener el identificador de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  const existingLinkByExternalId = await findLinkedInLinkByExternalId(linkedinId)

  if (existingLinkByExternalId && existingLinkByExternalId.usuarioId !== session.usuario.id) {
    throw new LinkedInAuthError(
      'Esta cuenta de LinkedIn ya está vinculada a otro usuario.',
      'LINKEDIN_AUTH_FAILED',
      409
    )
  }

  const existingLinkByUser = await findLinkedInLinkByUserId(session.usuario.id)

  if (existingLinkByUser) {
    if (existingLinkByUser.idExterno === linkedinId) {
      await linkLinkedInToUser(session.usuario.id, linkedinId, correoProveedor ?? '', tokenStorage)

      return {
        message: 'Autorización de LinkedIn renovada correctamente.',
        provider: 'linkedin',
        linkedEmail: correoProveedor ?? existingLinkByUser.correoProveedor
      }
    }

    throw new LinkedInAuthError(
      'Tu cuenta ya tiene otra cuenta de LinkedIn vinculada.',
      'LINKEDIN_AUTH_FAILED',
      409
    )
  }

  await createLinkedInLinkForUser({
    usuarioId: session.usuario.id,
    linkedinId,
    correoProveedor,
    tokenStorage
  })

  return {
    message: 'LinkedIn fue vinculado correctamente.',
    provider: 'linkedin',
    linkedEmail: correoProveedor
  }
}

export const registerWithLinkedInCodeService = async (
  code: string
): Promise<LinkedInLoginSuccess> => {
  if (!code?.trim()) {
    throw new LinkedInAuthError(
      'LinkedIn no devolvió un código válido.',
      'LINKEDIN_AUTH_FAILED',
      400
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const linkedinUser = await getLinkedInUserInfo(tokenData.access_token!)
  const tokenStorage = buildLinkedInTokenStorage(tokenData)

  const linkedinId = linkedinUser.sub?.trim()
  const correo = linkedinUser.email?.trim().toLowerCase()

  if (!linkedinId || !correo) {
    throw new LinkedInAuthError(
      'No se pudo obtener la información de la cuenta de LinkedIn.',
      'LINKEDIN_AUTH_FAILED',
      401
    )
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(correo)) {
    throw new LinkedInAuthError(
      'No fue posible obtener un correo válido desde LinkedIn.',
      'INVALID_EMAIL',
      400
    )
  }

  const userByLinkedInId = await findUserByLinkedInId(linkedinId)

  if (userByLinkedInId) {
    throw new LinkedInAuthError(
      'Esta cuenta de LinkedIn ya está registrada. Inicia sesión con LinkedIn desde la pantalla de login.',
      'ACCOUNT_ALREADY_REGISTERED',
      409
    )
  }

  const existingUserByEmail = await findUserByLinkedInEmail(correo)

if (existingUserByEmail) {
  if (existingUserByEmail.activo === false) {
    throw new LinkedInAuthError('Esta cuenta está desactivada', 'ACCOUNT_DEACTIVATED', 403)
  }

  throw new LinkedInAuthError(
    'Este correo ya está registrado. Inicia sesión con tu método actual y vincula LinkedIn desde Seguridad.',
    'ACCOUNT_ALREADY_REGISTERED',
    409
  )
}

  const nombre = linkedinUser.given_name?.trim() || linkedinUser.name?.split(' ')[0] || 'Usuario'

  const apellido =
    linkedinUser.family_name?.trim() ||
    linkedinUser.name?.split(' ').slice(1).join(' ') ||
    'LinkedIn'

  const avatar = linkedinUser.picture?.trim() || null

  const createdUser = await createLinkedInUser(
    {
      nombre,
      apellido,
      correo,
      password: `linkedin_${randomUUID()}`,
      avatar
    },
    linkedinId,
    correo,
    tokenStorage
  )

  const emailResult = await enviarCorreoBienvenidaLinkedIn({
    emailDestino: createdUser.correo,
    nombreUsuario: createdUser.nombre
  })

  if (!emailResult.success) {
    console.error('No se pudo enviar el correo de bienvenida LinkedIn:', emailResult.error)
  }

  return await buildLinkedInSessionResponse(
    createdUser,
    'Cuenta creada e inicio de sesión con LinkedIn exitoso'
  )
}
