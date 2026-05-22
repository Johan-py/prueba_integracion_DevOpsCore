import { randomUUID } from 'node:crypto'
import { env } from '../../../config/env.js'
import { generateToken, type JwtPayload } from '../../../utils/jwt.js'
import {
  createDiscordSession,
  createDiscordUser,
  findUserByDiscordEmail,
  findUserByDiscordId,
  linkDiscordToUser,
  updateDiscordLastUsage
} from './discord.repository.js'
import {
  DiscordAuthError,
  type DiscordLoginSuccess,
  type DiscordTokenResponse,
  type DiscordUserInfo
} from './discord.types.js'

import {
  createDiscordLinkForUser,
  findDiscordLinkByExternalId,
  findDiscordLinkByUserId,
  findUserByDiscordSessionToken
} from './discord.repository.js'

const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_USERINFO_URL = 'https://discord.com/api/users/@me'
const SESSION_DURATION_MS = 60 * 60 * 1000

type DiscordAuthMode = 'login' | 'register'

const exchangeCodeForTokens = async (code: string) => {
  console.log('[Discord] Exchanging code for tokens...')
  console.log('[Discord] CLIENT_ID:', env.DISCORD_CLIENT_ID)
  console.log('[Discord] CALLBACK_URL:', env.DISCORD_CALLBACK_URL)
  console.log(
    '[Discord] CLIENT_SECRET preview:',
    `${env.DISCORD_CLIENT_SECRET?.substring(0, 4)}...${env.DISCORD_CLIENT_SECRET?.substring(env.DISCORD_CLIENT_SECRET.length - 4)}`
  )

  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.DISCORD_CALLBACK_URL
  })

  console.log('[Discord] Request body:', params.toString())

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PropBol/1.0 (https://propbol-tsiq.onrender.com)' // ← Agregado para evitar bloqueo de Cloudflare
    },
    body: params.toString()
  })

  console.log('[Discord] Response status:', response.status)
  console.log('[Discord] Response Content-Type:', response.headers.get('content-type'))

  // Verificar si la respuesta es JSON antes de parsear
  const contentType = response.headers.get('content-type')

  // Manejo específico para rate limiting
  if (response.status === 429) {
    const textResponse = await response.text()
    console.error('[Discord] Rate limit hit (429)')
    console.error('[Discord] Response:', textResponse.substring(0, 500))
    throw new DiscordAuthError(
      'Discord está limitando las peticiones. Espera unos minutos e intenta de nuevo.',
      'DISCORD_AUTH_FAILED',
      429
    )
  }

  if (!contentType?.includes('application/json')) {
    const textResponse = await response.text()
    console.error('[Discord] Unexpected response type:', contentType)
    console.error('[Discord] Raw response (first 1000 chars):', textResponse.substring(0, 1000))
    throw new DiscordAuthError(
      'Discord devolvió una respuesta inválida (HTML en lugar de JSON). Verifica las credenciales y el redirect_uri.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  const data = (await response.json()) as DiscordTokenResponse

  if (!response.ok || !data.access_token) {
    console.error(
      '[DISCORD ERROR]',
      JSON.stringify({
        status: response.status,
        error: data.error,
        error_description: data.error_description,
        client_id: env.DISCORD_CLIENT_ID,
        callback_url: env.DISCORD_CALLBACK_URL,
        secret_length: env.DISCORD_CLIENT_SECRET?.length,
        secret_preview: `${env.DISCORD_CLIENT_SECRET?.substring(0, 4)}...${env.DISCORD_CLIENT_SECRET?.substring(env.DISCORD_CLIENT_SECRET.length - 4)}`
      })
    )

    throw new DiscordAuthError(
      data.error_description || 'No se pudo obtener el token de Discord.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  console.log('[Discord] Token exchange successful')
  return data
}

const getDiscordUserInfo = async (accessToken: string) => {
  const response = await fetch(DISCORD_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const data = (await response.json()) as DiscordUserInfo

  if (!response.ok || !data.email?.trim()) {
    throw new DiscordAuthError(
      'No se pudo obtener el correo de la cuenta de Discord.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  return data
}

const resolveDiscordNames = (discordUser: DiscordUserInfo) => {
  const fullName = discordUser.global_name?.trim() || discordUser.username?.trim() || ''
  const parts = fullName.split(/\s+/)

  const nombre = parts[0] || discordUser.username?.trim() || 'Usuario'
  const apellido = parts.slice(1).join(' ') || 'Discord'

  return { nombre, apellido }
}

const buildDiscordSessionResponse = async (
  user: {
    id: number
    correo: string
    nombre: string
    apellido: string
    avatar?: string | null
  },
  message: string
): Promise<DiscordLoginSuccess> => {
  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS)

  await createDiscordSession({
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

const authenticateWithDiscord = async (
  code: string,
  mode: DiscordAuthMode
): Promise<DiscordLoginSuccess> => {
  if (!code?.trim()) {
    throw new DiscordAuthError('Discord no devolvió un código válido.', 'DISCORD_AUTH_FAILED', 400)
  }

  const tokenData = await exchangeCodeForTokens(code)
  const discordUser = await getDiscordUserInfo(tokenData.access_token as string)

  const discordId = discordUser.id?.trim()
  const correo = discordUser.email?.trim().toLowerCase()

  if (!discordId || !correo) {
    throw new DiscordAuthError(
      'No se pudo obtener la información de la cuenta de Discord.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  // Primero busca por ID de Discord en autenticacion_social
  const userByDiscordId = await findUserByDiscordId(discordId)

  if (mode === 'register') {
    if (userByDiscordId) {
      throw new DiscordAuthError(
        'Esta cuenta de Discord ya está registrada. Inicia sesión con Discord desde la pantalla de login.',
        'ACCOUNT_ALREADY_REGISTERED',
        409
      )
    }

    // Verifica si ya existe un usuario con ese correo (se registró con email)
    const existingUserByEmail = await findUserByDiscordEmail(correo)

    if (existingUserByEmail) {
      // Ya tiene cuenta con ese correo → solo vincula Discord
      await linkDiscordToUser(existingUserByEmail.id, discordId, correo)

      return await buildDiscordSessionResponse(
        existingUserByEmail,
        'Discord vinculado e inicio de sesión exitoso'
      )
    }

    // Usuario nuevo → crea cuenta y vincula Discord
    const { nombre, apellido } = resolveDiscordNames(discordUser)

    const createdUser = await createDiscordUser(
      {
        nombre,
        apellido,
        correo,
        password: `discord_${randomUUID()}`
      },
      discordId,
      correo
    )

    return await buildDiscordSessionResponse(
      createdUser,
      'Cuenta creada e inicio de sesión con Discord exitoso'
    )
  }

  // Modo login
  if (userByDiscordId) {
    await updateDiscordLastUsage(userByDiscordId.id, discordId)

    return await buildDiscordSessionResponse(
      userByDiscordId,
      'Inicio de sesión con Discord exitoso'
    )
  }

  // No tiene Discord vinculado → verifica si tiene cuenta con ese correo
  const existingUserByEmail = await findUserByDiscordEmail(correo)

  if (existingUserByEmail) {
    // Tiene cuenta pero no tiene Discord vinculado → lo vincula automáticamente
    await linkDiscordToUser(existingUserByEmail.id, discordId, correo)

    return await buildDiscordSessionResponse(
      existingUserByEmail,
      'Discord vinculado e inicio de sesión exitoso'
    )
  }

  throw new DiscordAuthError(
    'Esta cuenta no está registrada. Debes registrarte primero con Discord.',
    'ACCOUNT_NOT_REGISTERED',
    404
  )
}

export const loginWithDiscordCodeService = async (code: string): Promise<DiscordLoginSuccess> => {
  return await authenticateWithDiscord(code, 'login')
}

export const registerWithDiscordCodeService = async (
  code: string
): Promise<DiscordLoginSuccess> => {
  return await authenticateWithDiscord(code, 'register')
}

export type DiscordLinkSuccess = {
  message: string
  provider: 'discord'
  linkedEmail: string | null
}

export const linkDiscordToCurrentUserByCodeService = async (
  sessionToken: string,
  code: string
): Promise<DiscordLinkSuccess> => {
  if (!sessionToken?.trim()) {
    throw new DiscordAuthError(
      'No se encontró la sesión activa para vincular Discord.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  if (!code?.trim()) {
    throw new DiscordAuthError('Discord no devolvió un código válido.', 'DISCORD_AUTH_FAILED', 400)
  }

  const session = await findUserByDiscordSessionToken(sessionToken)

  if (!session?.usuario) {
    throw new DiscordAuthError(
      'Tu sesión ya no es válida. Vuelve a iniciar sesión en PropBol.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  const tokenData = await exchangeCodeForTokens(code)
  const discordUser = await getDiscordUserInfo(tokenData.access_token as string)

  const discordId = discordUser.id?.trim()
  const correoProveedor = discordUser.email?.trim().toLowerCase() ?? null

  if (!discordId) {
    throw new DiscordAuthError(
      'No se pudo obtener el identificador de Discord.',
      'DISCORD_AUTH_FAILED',
      401
    )
  }

  const existingLinkByExternalId = await findDiscordLinkByExternalId(discordId)

  if (existingLinkByExternalId && existingLinkByExternalId.usuarioId !== session.usuario.id) {
    throw new DiscordAuthError(
      'Esta cuenta de Discord ya está vinculada a otro usuario.',
      'DISCORD_AUTH_FAILED',
      409
    )
  }

  const existingLinkByUser = await findDiscordLinkByUserId(session.usuario.id)

  if (existingLinkByUser) {
    if (existingLinkByUser.idExterno === discordId) {
      return {
        message: 'Tu cuenta de Discord ya estaba vinculada.',
        provider: 'discord',
        linkedEmail: existingLinkByUser.correoProveedor ?? correoProveedor
      }
    }

    throw new DiscordAuthError(
      'Tu cuenta ya tiene otra cuenta de Discord vinculada.',
      'DISCORD_AUTH_FAILED',
      409
    )
  }

  await createDiscordLinkForUser({
    usuarioId: session.usuario.id,
    discordId,
    correoProveedor
  })

  return {
    message: 'Discord fue vinculado correctamente.',
    provider: 'discord',
    linkedEmail: correoProveedor
  }
}
