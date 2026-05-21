import 'dotenv/config'

const requireEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
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
  DISCORD_CLIENT_ID: requireEnv('DISCORD_CLIENT_ID'),
  DISCORD_CLIENT_SECRET: requireEnv('DISCORD_CLIENT_SECRET'),
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL ?? 'http://localhost:5000/api/auth/discord/callback',

  FACEBOOK_CLIENT_ID: requireEnv('FACEBOOK_CLIENT_ID'),
  FACEBOOK_CLIENT_SECRET: requireEnv('FACEBOOK_CLIENT_SECRET'),
  FACEBOOK_CALLBACK_URL:
    process.env.FACEBOOK_CALLBACK_URL ?? 'http://localhost:5000/api/auth/facebook/callback',

  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  EMAIL_USER: requireEnv('EMAIL_USER'),
  EMAIL_PASSWORD:
    process.env.EMAIL_PASSWORD ?? process.env.BREVO_API_KEY ?? requireEnv('EMAIL_PASSWORD'),

  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? requireEnv('ADMIN_EMAIL'),
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ?? 'http://localhost:8080',
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ?? '',
  EVOLUTION_INSTANCE: process.env.EVOLUTION_INSTANCE ?? 'propbol',

  CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
  CLOUDINARY_MULTIMEDIA_FOLDER:
    process.env.CLOUDINARY_MULTIMEDIA_FOLDER ?? 'propbol/publicaciones/multimedia',

  LINKEDIN_CLIENT_ID: requireEnv('LINKEDIN_CLIENT_ID'),
  LINKEDIN_CLIENT_SECRET: requireEnv('LINKEDIN_CLIENT_SECRET'),
  LINKEDIN_CALLBACK_URL:
    process.env.LINKEDIN_CALLBACK_URL ?? 'http://localhost:5000/api/auth/linkedin/callback'
}
