import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

export type JwtPayload = {
  id: number
  correo: string
}

export const generateToken = (payload: JwtPayload) => {
  const secret = process.env.JWT_SECRET

  if (!secret) throw new Error('JWT_SECRET is not defined')

  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID()
    },
    secret,
    {
      expiresIn: '1h'
    }
  )
}

export const verifyJwtToken = (token: string) => {
  const secret = process.env.JWT_SECRET

  if (!secret) throw new Error('JWT_SECRET is not defined')

  return jwt.verify(token, secret) as {
    id: number
    correo: string
    jti: string
    iat: number
    exp: number
  }
}
