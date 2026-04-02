import { Request, Response } from 'express'
import { AuthError, loginService, logoutService, registerUser } from './auth.service.js'

type RegisterBody = {
  nombre: string
  apellido: string
  correo: string
  password: string
  confirmPassword: string
  telefono?: string
}

const getRegisterErrorStatus = (message: string) => {
  if (message === 'El correo ya está registrado') return 409
  return 400
}

export const loginController = async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body
    const result = await loginService({ correo, password })

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      ...result
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.retryAfterSeconds) {
        res.setHeader('Retry-After', String(error.retryAfterSeconds))
      }

      return res.status(error.statusCode).json({
        message: error.message
      })
    }

    const message = error instanceof Error ? error.message : 'Error interno del servidor'

    return res.status(400).json({ message })
  }
}

export const registerController = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response
) => {
  try {
    const { nombre, apellido, correo, password, confirmPassword, telefono } = req.body

    const result = await registerUser({
      nombre,
      apellido,
      correo,
      password,
      confirmPassword,
      telefono
    })

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: result.user,
      token: result.token
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'

    return res.status(getRegisterErrorStatus(message)).json({ message })
  }
}

export const logoutController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const result = await logoutService(token)
    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cerrar sesión'
    return res.status(400).json({ message })
  }
}
