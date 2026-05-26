import { prisma } from '../../../lib/prisma.client.js'
import {
  createSession,
  createSocialLink,
  createUser,
  findSocialLinkByProviderAndExternalId,
  findSocialLinkByUserAndProvider,
  findUserByActiveSessionTokenForSocialLink,
  findUserByCorreo
} from '../auth.repository.js'

type CreateGoogleUserInput = {
  nombre: string
  apellido: string
  correo: string
  password: string
}

export const findUserByGoogleId = async (googleId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'google',
      id_externo: googleId,
      activo: true
    },
    include: {
      usuario: true
    }
  })

  return social?.usuario ?? null
}

export const findUserByGoogleEmail = async (correo: string) => {
  return await findUserByCorreo(correo)
}

export const createGoogleUser = async (
  data: CreateGoogleUserInput,
  googleId: string,
  correo_proveedor: string
) => {
  return await prisma.$transaction(async (tx) => {
    const rol = await tx.rol.upsert({
      where: { nombre: 'VISITANTE' },
      update: {},
      create: { nombre: 'VISITANTE' }
    })

    const user = await tx.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        password: data.password,
        rolId: rol.id
      }
    })

    await tx.autenticacion_social.create({
      data: {
        usuarioId: user.id,
        proveedor: 'google',
        id_externo: googleId,
        correo_proveedor,
        activo: true
      }
    })

    return user
  })
}

export const linkGoogleToUser = async (
  usuarioId: number,
  googleId: string,
  correo_proveedor: string
) => {
  return await createSocialLink({
    usuarioId,
    proveedor: 'google',
    id_externo: googleId,
    correo_proveedor
  })
}

export const createGoogleSession = async ({
  token,
  usuarioId,
  fecha_expiracion
}: {
  token: string
  usuarioId: number
  fecha_expiracion: Date
}) => {
  return await createSession({
    token,
    usuarioId,
    fecha_expiracion
  })
}

export const findGoogleLinkByExternalId = async (googleId: string) => {
  return await findSocialLinkByProviderAndExternalId('google', googleId)
}

export const findGoogleLinkByUserId = async (usuarioId: number) => {
  return await findSocialLinkByUserAndProvider(usuarioId, 'google')
}

export const createGoogleLinkForUser = async ({
  usuarioId,
  googleId,
  correo_proveedor
}: {
  usuarioId: number
  googleId: string
  correo_proveedor?: string | null
}) => {
  return await createSocialLink({
    usuarioId,
    proveedor: 'google',
    id_externo: googleId,
    correo_proveedor
  })
}

export const findUserByGoogleSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateGoogleLastUsage = async (usuarioId: number, googleId: string) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuarioId,
      proveedor: 'google',
      id_externo: googleId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date()
    }
  })
}

