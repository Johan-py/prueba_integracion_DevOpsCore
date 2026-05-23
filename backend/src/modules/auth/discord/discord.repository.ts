import { prisma } from '../../../lib/prisma.client.js'
import {
  createSession,
  createUser,
  findUserByCorreo,
  createSocialLink,
  findSocialLinkByProviderAndExternalId,
  findSocialLinkByUserAndProvider,
  findUserByActiveSessionTokenForSocialLink
} from '../auth.repository.js'

type CreateDiscordUserInput = {
  nombre: string
  apellido: string
  correo: string
  password: string
}

// Busca si ya existe un vínculo con Discord por su ID externo
export const findUserByDiscordId = async (discordId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'discord',
      id_externo: discordId,
      activo: true
    },
    include: {
      usuario: true
    }
  })

  return social?.usuario ?? null
}

// Busca usuario por correo (fallback)
export const findUserByDiscordEmail = async (correo: string) => {
  return await findUserByCorreo(correo)
}

// Crea el usuario y registra el vínculo con Discord
export const createDiscordUser = async (
  data: CreateDiscordUserInput,
  discordId: string,
  correo_proveedor: string
) => {
  const user = await createUser({
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    password: data.password
  })

  await createSocialLink({
    usuario_id: user.id,
    proveedor: 'discord',
    id_externo: discordId,
    correo_proveedor
  })

  return user
}

// Vincula Discord a un usuario existente (si se registró con email y luego vincula Discord)
export const linkDiscordToUser = async (
  usuario_id: number,
  discordId: string,
  correo_proveedor: string
) => {
  return await createSocialLink({
    usuario_id,
    proveedor: 'discord',
    id_externo: discordId,
    correo_proveedor
  })
}

export const createDiscordSession = async ({
  token,
  usuario_id,
  fecha_expiracion
}: {
  token: string
  usuario_id: number
  fecha_expiracion: Date
}) => {
  return await createSession({
    token,
    usuario_id,
    fecha_expiracion
  })
}

export const findDiscordLinkByExternalId = async (discordId: string) => {
  return await findSocialLinkByProviderAndExternalId('discord', discordId)
}

export const findDiscordLinkByUserId = async (usuario_id: number) => {
  return await findSocialLinkByUserAndProvider(usuario_id, 'discord')
}

export const createDiscordLinkForUser = async ({
  usuario_id,
  discordId,
  correo_proveedor
}: {
  usuario_id: number
  discordId: string
  correo_proveedor?: string | null
}) => {
  return await createSocialLink({
    usuario_id,
    proveedor: 'discord',
    id_externo: discordId,
    correo_proveedor
  })
}

export const findUserByDiscordSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateDiscordLastUsage = async (usuario_id: number, discordId: string) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuario_id,
      proveedor: 'discord',
      id_externo: discordId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date()
    }
  })
}

