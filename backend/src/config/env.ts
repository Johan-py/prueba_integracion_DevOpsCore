import 'dotenv/config'

const requireEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} no está definido en el entorno`)
  }

  return value
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: requireEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: requireEnv('GOOGLE_CALLBACK_URL'),
  FRONTEND_URL: requireEnv('FRONTEND_URL')
}