import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

import { env } from '../../config/env.js'
import { enviarCodigoRegistro } from '../../lib/email.service.js'
import { generateToken, type JwtPayload } from '../../utils/jwt.js'
import {
  createSession,
  createUser,
  desactiveSessionByToken,
  findActiveSessionByToken,
  findUser,
  findUserByCorreo
} from './auth.repository.js'

type LoginDTO = {
  correo: string
  password: string
}

type RegisterDTO = {
  nombre: string
  apellido: string
  correo: string
  password: string
  confirmPassword: string
  telefono?: string
}

type VerifyRegisterCodeDTO = {
  verificationToken: string
  codigo: string
  password: string
}

type PendingRegisterPayload = {
  purpose: 'pending-register'
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  nonce: string
  codeSignature: string
}

type LoginAttemptState = {
  failedAttempts: number
  blockedUntil: number | null
}

export class AuthError extends Error {
  statusCode: number
  retryAfterSeconds?: number

  constructor(message: string, statusCode = 400, retryAfterSeconds?: number) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const MAX_NOMBRE = 30
const MAX_APELLIDO = 30
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_BLOCK_TIME_MS = 15 * 60 * 1000

const REGISTER_CODE_TTL_MINUTES = 5
const REGISTER_CODE_TTL_SECONDS = REGISTER_CODE_TTL_MINUTES * 60

const loginAttempts = new Map<string, LoginAttemptState>()

const DUPLICATE_EMAIL_MESSAGE = 'El correo ya está registrado'

const isDuplicateEmailError = (error: unknown) => {
  if (!(error instanceof Error)) return false

  const normalized = error.message.toLowerCase()

  return (
    normalized === DUPLICATE_EMAIL_MESSAGE.toLowerCase() ||
    (normalized.includes('unique constraint failed') && normalized.includes('correo'))
  )
}

const getAttemptState = (correo: string): LoginAttemptState => {
  const existingState = loginAttempts.get(correo)

  if (existingState) {
    return existingState
  }

  const newState: LoginAttemptState = {
    failedAttempts: 0,
    blockedUntil: null
  }

  loginAttempts.set(correo, newState)
  return newState
}

const getBlockStatus = (correo: string) => {
  const state = getAttemptState(correo)

  if (!state.blockedUntil) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    }
  }

  const remainingMs = state.blockedUntil - Date.now()

  if (remainingMs <= 0) {
    loginAttempts.delete(correo)

    return {
      blocked: false,
      retryAfterSeconds: 0
    }
  }

  return {
    blocked: true,
    retryAfterSeconds: Math.ceil(remainingMs / 1000)
  }
}

const registerFailedAttempt = (correo: string) => {
  const state = getAttemptState(correo)

  state.failedAttempts += 1

  if (state.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    state.blockedUntil = Date.now() + LOGIN_BLOCK_TIME_MS
    loginAttempts.set(correo, state)

    return {
      blocked: true,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil(LOGIN_BLOCK_TIME_MS / 1000)
    }
  }

  loginAttempts.set(correo, state)

  return {
    blocked: false,
    attemptsLeft: MAX_LOGIN_ATTEMPTS - state.failedAttempts,
    retryAfterSeconds: 0
  }
}

const clearFailedAttempts = (correo: string) => {
  loginAttempts.delete(correo)
}

const normalizeRegisterPayload = (payload: RegisterDTO) => {
  const nombre = payload.nombre?.trim()
  const apellido = payload.apellido?.trim()
  const correo = payload.correo?.trim().toLowerCase()
  const password = payload.password?.trim()
  const confirmPassword = payload.confirmPassword?.trim()
  const telefono = payload.telefono?.trim() || undefined

  if (!nombre || !apellido || !correo || !password || !confirmPassword) {
    throw new Error('Todos los campos obligatorios deben ser completados')
  }

  if (nombre.length > MAX_NOMBRE) {
    throw new Error(`El nombre no puede superar ${MAX_NOMBRE} caracteres`)
  }

  if (apellido.length > MAX_APELLIDO) {
    throw new Error(`El apellido no puede superar ${MAX_APELLIDO} caracteres`)
  }

  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden')
  }

  return {
    nombre,
    apellido,
    correo,
    password,
    telefono
  }
}

const generateRegisterCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const signRegisterCode = ({
  codigo,
  correo,
  nonce
}: {
  codigo: string
  correo: string
  nonce: string
}) => {
  return crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${codigo}:${correo}:${nonce}:pending-register`)
    .digest('hex')
}

const isMatchingCodeSignature = (expectedSignature: string, currentSignature: string) => {
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
  const currentBuffer = Buffer.from(currentSignature, 'utf8')

  if (expectedBuffer.length !== currentBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, currentBuffer)
}

const generatePendingRegisterToken = (payload: PendingRegisterPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: REGISTER_CODE_TTL_SECONDS
  })
}

const verifyPendingRegisterToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & PendingRegisterPayload

    if (decoded.purpose !== 'pending-register') {
      throw new Error('Token de verificación inválido')
    }

    return decoded
  } catch {
    throw new Error('El código expiró o ya no es válido. Vuelve a registrarte.')
  }
}

export const loginService = async (payload: LoginDTO) => {
  const correo = payload.correo?.trim().toLowerCase()
  const password = payload.password?.trim()

  if (!correo || !password) {
    throw new Error('Correo y contraseña son obligatorios')
  }

  const blockStatus = getBlockStatus(correo)

  if (blockStatus.blocked) {
    const remainingMinutes = Math.ceil(blockStatus.retryAfterSeconds / 60)

    throw new AuthError(
      `La cuenta sigue bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
      429,
      blockStatus.retryAfterSeconds
    )
  }

  const user = await findUser(correo)

  if (!user) {
    throw new AuthError('Usuario no encontrado', 404)
  }

  const isValidPassword = user.password === password

  if (!isValidPassword) {
    const attemptStatus = registerFailedAttempt(correo)

    if (attemptStatus.blocked) {
      const blockMinutes = Math.ceil(LOGIN_BLOCK_TIME_MS / 60000)

      throw new AuthError(
        `Has superado el número permitido de intentos. La cuenta fue bloqueada temporalmente por ${blockMinutes} minuto(s).`,
        429,
        attemptStatus.retryAfterSeconds
      )
    }

    throw new AuthError(
      `Credenciales inválidas. Te quedan ${attemptStatus.attemptsLeft} intento(s) antes del bloqueo temporal.`,
      401
    )
  }

  clearFailedAttempts(correo)

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000)

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion
  })

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido
    },
    token
  }
}

export const registerUser = async (payload: RegisterDTO) => {
  const normalized = normalizeRegisterPayload(payload)

  const existingUser = await findUserByCorreo(normalized.correo)

  if (existingUser) {
    throw new Error('El correo ya está registrado')
  }

  const codigo = generateRegisterCode()
  const nonce = crypto.randomUUID()

  const verificationToken = generatePendingRegisterToken({
    purpose: 'pending-register',
    nombre: normalized.nombre,
    apellido: normalized.apellido,
    correo: normalized.correo,
    telefono: normalized.telefono,
    nonce,
    codeSignature: signRegisterCode({
      codigo,
      correo: normalized.correo,
      nonce
    })
  })

  const emailResult = await enviarCodigoRegistro({
    emailDestino: normalized.correo,
    codigo,
    nombreUsuario: normalized.nombre
  })

  if (!emailResult.success) {
    throw new Error('No se pudo enviar el código de verificación. Intenta nuevamente.')
  }

  return {
    email: normalized.correo,
    verificationToken,
    requiresEmailVerification: true,
    expiresInMinutes: REGISTER_CODE_TTL_MINUTES
  }
}

export const verifyRegisterCodeService = async (payload: VerifyRegisterCodeDTO) => {
  const verificationToken = payload.verificationToken?.trim()
  const codigo = payload.codigo?.trim()
  const password = payload.password?.trim()

  if (!verificationToken || !codigo || !password) {
    throw new Error('Token, código y contraseña son obligatorios')
  }

  const decoded = verifyPendingRegisterToken(verificationToken)

  const expectedSignature = signRegisterCode({
    codigo,
    correo: decoded.correo,
    nonce: decoded.nonce
  })

  if (!isMatchingCodeSignature(expectedSignature, decoded.codeSignature)) {
    throw new Error('El código ingresado no es válido')
  }

  const existingUser = await findUserByCorreo(decoded.correo)

  if (existingUser) {
    throw new AuthError(DUPLICATE_EMAIL_MESSAGE, 409)
  }
  let newUser

  try {
    newUser = await createUser({
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      correo: decoded.correo,
      password,
      telefono: decoded.telefono
    })
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new AuthError(DUPLICATE_EMAIL_MESSAGE, 409)
    }

    throw error
  }

  const jwtPayload: JwtPayload = {
    id: newUser.id,
    correo: newUser.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000)

  await createSession({
    token,
    usuarioId: newUser.id,
    fechaExpiracion
  })

  return {
    user: {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      correo: newUser.correo,
      telefonos: newUser.telefonos
    },
    token
  }
}

export const getMeService = async (token: string) => {
  const session = await findActiveSessionByToken(token)

  if (!session) {
    throw new Error('Sesión inválida o expirada')
  }

  return {
    user: {
      id: session.usuario.id,
      nombre: session.usuario.nombre,
      apellido: session.usuario.apellido,
      correo: session.usuario.correo,
      rol: session.usuario.rol
    }
  }
}

export const logoutService = async (token: string) => {
  const session = await findActiveSessionByToken(token)

  if (!session) {
    throw new Error('Sesión inválida o expirada')
  }

  await desactiveSessionByToken(token)

  return {
    message: 'Logout exitoso'
  }
}

type GoogleTokenResponse = {
  access_token?: string
  expires_in?: number
  id_token?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type GoogleUserInfoResponse = {
  id?: string
  email?: string
  verified_email?: boolean
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
}

export const loginWithGoogleCodeService = async (code: string) => {
  const normalizedCode = code?.trim()

  if (!normalizedCode) {
    throw new Error('Google no devolvió un código válido')
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code: normalizedCode,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    }).toString()
  })

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error('No se pudo validar la autenticación con Google')
  }

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  })

  const googleUser = (await userInfoResponse.json()) as GoogleUserInfoResponse

  if (!userInfoResponse.ok) {
    throw new Error('No se pudo obtener la información de la cuenta de Google')
  }

  const correo = googleUser.email?.trim().toLowerCase()

  if (!correo || googleUser.verified_email === false) {
    throw new Error('Google no devolvió un correo válido')
  }

  const user = await findUserByCorreo(correo)

  if (!user) {
    throw new AuthError('Esta cuenta de Google no está registrada. Regístrate primero.', 404)
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo
  }

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000)

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion
  })

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido
    },
    token
  }
}
