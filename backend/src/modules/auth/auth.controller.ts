import { loginService } from './auth.service.js'
type payload = {
  name: string
  email: string
}
export const loginController = async (body: payload) => {
  return loginService(body)
}
