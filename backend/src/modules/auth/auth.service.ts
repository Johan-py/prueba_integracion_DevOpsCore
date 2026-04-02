import { generateToken, type JwtPayload } from '../../utils/jwt.js'
import {
  createSession,
  createUser,
  desactiveSessionByToken,
  findActiveSessionByToken,
  findUser
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

const loginAttempts = new Map<string, LoginAttemptState>()

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

  const newUser = await createUser({
    nombre,
    apellido,
    correo,
    password,
    telefono
  })

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
