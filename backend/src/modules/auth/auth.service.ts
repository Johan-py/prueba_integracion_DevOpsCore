import { generateToken, type JwtPayload } from '../../utils/jwt.js'
import {
  createSession,
  createUser,
  desactiveSessionByToken,
  findActiveSessionByToken,
  findUser
} from './auth.repository.js'

type LoginDTO = {
  email: string
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

const MAX_NOMBRE = 30
const MAX_APELLIDO = 30

export const loginService = async (payload: LoginDTO) => {
  const email = payload.email?.trim().toLowerCase()
  const password = payload.password?.trim()

  if (!email || !password) {
    throw new Error('Correo y contraseña son obligatorios')
  }

  const user = await findUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  const isValidPassword = user.password === password

  if (!isValidPassword) {
    throw new Error('Invalid credentials')
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
      correo: user.correo
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