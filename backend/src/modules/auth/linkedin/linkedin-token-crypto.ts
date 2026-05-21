import { createCipheriv, createHash, randomBytes } from 'node:crypto'
import { env } from '../../../config/env.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

const getEncryptionKey = () => {
  return createHash('sha256').update(env.JWT_SECRET).digest()
}

export const encryptLinkedInAccessToken = (accessToken: string) => {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)

  const encrypted = Buffer.concat([cipher.update(accessToken, 'utf8'), cipher.final()])

  const authTag = cipher.getAuthTag()

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join('.')
}
