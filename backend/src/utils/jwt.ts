<<<<<<< HEAD
import jwt from 'jsonwebtoken'
=======
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
export type JwtPayload = {
  id: number
  correo: string
}
export const generateToken = (payload: JwtPayload) => {
  const secret = process.env.JWT_SECRET

  if (!secret) throw new Error('JWT_SECRET is not defined')

<<<<<<< HEAD
  return jwt.sign(payload, secret, {
    expiresIn: '1h'
  })
=======
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
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
}

export const verifyJwtToken = (token: string) => {
  const secret = process.env.JWT_SECRET

  if (!secret) throw new Error('JWT_SECRET is not defined')

  return jwt.verify(token, secret) as {
    id: number
    correo: string
<<<<<<< HEAD
=======
    jti: string
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
    iat: number
    exp: number
  }
}
