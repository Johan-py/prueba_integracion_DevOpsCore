import { generateToken } from '../../utils/jwt.js'
import { findUser } from './auth.repository.js'

export const loginService = async ({ email, password }: { email: string; password: string }) => {

  const user = await findUser(email)

  const trimmedPassword = password.trim()

  if (!user) {
    throw new Error('User not found')
  }

  const token = generateToken(user)

  return { user, token }
}
