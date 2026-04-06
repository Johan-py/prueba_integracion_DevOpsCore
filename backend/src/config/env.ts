import 'dotenv/config'

const requireEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required enviroment variable: ${name}`)
  }

  return value
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: requireEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000'
}
