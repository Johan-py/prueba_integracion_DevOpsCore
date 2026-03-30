import { getUsersService, createUserService } from './users.service.js'

type CreateUserBody = {
  name: string
  password: string
  confirmPassword: string
}

export const getUsersController = async () => {
  return getUsersService()
}

export const createUserController = async (data: CreateUserBody) => {
  return createUserService(data)
}
