import { generateToken, type JwtPayload } from '../../utils/jwt.js'
import { findUser } from './auth.repository.js'

type LoginDTO = {
  email: string
}

type User = {
  id: number
  email: string
}

export const loginService = async (payload: LoginDTO): Promise<{ user: User; token: string }> => {
  const { email } = payload

  const user = await findUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    email: user.email
  }

  const token = generateToken(jwtPayload)

  return { user, token }
}
