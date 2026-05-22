export class LinkedInAuthError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode = 400) {
    super(message)
    this.name = 'LinkedInAuthError'
    this.code = code
    this.statusCode = statusCode
  }
}

export type LinkedInStatePayload = {
  mode: 'login' | 'register' | 'link'
  sessionToken?: string
}

export type LinkedInTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export type LinkedInUserInfo = {
  sub: string
  name?: string
  given_name?: string
  family_name?: string
  email?: string
  picture?: string
}

export type LinkedInLoginSuccess = {
  message: string
  token: string
  user: {
    id: number
    correo: string
    nombre: string
    apellido: string
    avatar?: string | null
  }
}

export type LinkedInLinkSuccess = {
  message: string
  provider: 'linkedin'
  linkedEmail: string | null
}
