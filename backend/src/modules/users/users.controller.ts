import { getUsersService, createUserService } from './users.service.js'
type payload = {
  name: string
}
export const getUsersController = async () => {
  return getUsersService()
}

export const createUserController = async (data: payload) => {
  return createUserService(data)
}
