import { getUsersService, createUserService } from './users.service.js'
type payload = {
  name: string
}
export const getUsersController = async () => {
  return getUsersService()
}

type CreateUserBody = {
  name: string
  password: string
  confirmPassword: string
}

export const createUserController = async (data: CreateUserBody) => {
  return createUserService(data)
}
