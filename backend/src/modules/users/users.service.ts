import { getUsersRepository, createUserRepository } from './users.repository.js'
type payload = {
  name: string
  password: string
  confirmPassword: string
}
export const getUsersService = async () => {
  return getUsersRepository()
}

export const createUserService = async (data: payload) => {
  // 🔥 lógica de negocio (validaciones, reglas, etc.)
  if (!data.name) {
    throw new Error('Name is required')
  }
  if (!data.password) {
    throw new Error('Password is required')
  }

  if (!data.confirmPassword) {
    throw new Error('Confirm password is required')
  }

  if (data.password !== data.confirmPassword) {
    throw new Error('Las contraseñas no coinciden')
  }

  const { confirmPassword, ...userData } = data

  return createUserRepository(userData)
}
