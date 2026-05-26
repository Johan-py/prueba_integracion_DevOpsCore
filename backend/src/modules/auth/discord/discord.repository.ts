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
// Retorna el usuario completo (no solo el ID) para que el service pueda usarlo
export const findUserByDiscordId = async (discordId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'discord',
      idExterno: discordId,
      activo: true
    },
    include: {
      usuario: true
    }
  })

  return social?.usuario ?? null // era: social?.usuarioId ?? null
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
    usuarioId: user.id,
    proveedor: 'discord',
    idExterno: discordId,       // era: id_externo
    correoProveedor: correo_proveedor  // era: correo_proveedor
  })

  return user
}

// Vincula Discord a un usuario existente
export const linkDiscordToUser = async (
  usuarioId: number,
  discordId: string,
  correo_proveedor: string
) => {
  return await createSocialLink({
    usuarioId,
    proveedor: 'discord',
    idExterno: discordId,       // era: id_externo
    correoProveedor: correo_proveedor  // era: correo_proveedor
  })
}

export const createDiscordSession = async ({
  token,
  usuarioId,
  fechaExpiracion  // era: fecha_expiracion
}: {
  token: string
  usuarioId: number
  fechaExpiracion: Date  // era: fecha_expiracion
}) => {
  return await createSession({
    token,
    usuarioId,
    fechaExpiracion  // era: fecha_expiracion
  })
}

export const findDiscordLinkByExternalId = async (discordId: string) => {
  return await findSocialLinkByProviderAndExternalId('discord', discordId)
}

export const findDiscordLinkByUserId = async (usuarioId: number) => {
  return await findSocialLinkByUserAndProvider(usuarioId, 'discord')
}

export const createDiscordLinkForUser = async ({
  usuarioId,
  discordId,
  correo_proveedor
}: {
  usuarioId: number
  discordId: string
  correo_proveedor?: string | null
}) => {
  return await createSocialLink({
    usuarioId,
    proveedor: 'discord',
    idExterno: discordId,              // era: id_externo
    correoProveedor: correo_proveedor  // era: correo_proveedor
  })
}

export const findUserByDiscordSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateDiscordLastUsage = async (usuarioId: number, discordId: string) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuarioId,
      proveedor: 'discord',
      idExterno: discordId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date()
    }
  })
}