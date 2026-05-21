import { prisma } from '../../../lib/prisma.client.js'
import {
  createSession,
  createSocialLink,
  findSocialLinkByProviderAndExternalId,
  findSocialLinkByUserAndProvider,
  findUserByActiveSessionTokenForSocialLink,
  findUserByCorreo
} from '../auth.repository.js'

type CreateLinkedInUserInput = {
  nombre: string
  apellido: string
  correo: string
  password: string
  avatar?: string | null
}

type LinkedInTokenStorageInput = {
  encryptedAccessToken: string
  tokenExpiresAt: Date | null
}

export const findUserByLinkedInId = async (linkedinId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'linkedin',
      idExterno: linkedinId,
      activo: true
    },
    include: { usuario: true }
  })

  return social?.usuario ?? null
}

export const findUserByLinkedInEmail = async (correo: string) => {
  return await findUserByCorreo(correo)
}

export const createLinkedInUser = async (
  data: CreateLinkedInUserInput,
  linkedinId: string,
  correoProveedor: string,
  tokenStorage: LinkedInTokenStorageInput
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
        rolId: rol.id,
        avatar: data.avatar ?? null
      }
    })

    await tx.autenticacion_social.create({
      data: {
        usuarioId: user.id,
        proveedor: 'linkedin',
        idExterno: linkedinId,
        correoProveedor,
        activo: true,
        vinculadoEn: new Date(),
        ultimo_uso_en: new Date(),
        token_acceso_cifrado: tokenStorage.encryptedAccessToken,
        token_expira_en: tokenStorage.tokenExpiresAt
      }
    })

    return user
  })
}

export const linkLinkedInToUser = async (
  usuarioId: number,
  linkedinId: string,
  correoProveedor: string,
  tokenStorage: LinkedInTokenStorageInput
) => {
  const existingLink = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'linkedin',
      idExterno: linkedinId
    }
  })

  if (existingLink) {
    return await prisma.autenticacion_social.update({
      where: {
        id: existingLink.id
      },
      data: {
        usuarioId,
        correoProveedor,
        activo: true,
        vinculadoEn: new Date(),
        ultimo_uso_en: new Date(),
        token_acceso_cifrado: tokenStorage.encryptedAccessToken,
        token_expira_en: tokenStorage.tokenExpiresAt
      }
    })
  }

  return await prisma.autenticacion_social.create({
    data: {
      usuarioId,
      proveedor: 'linkedin',
      idExterno: linkedinId,
      correoProveedor,
      activo: true,
      vinculadoEn: new Date(),
      ultimo_uso_en: new Date(),
      token_acceso_cifrado: tokenStorage.encryptedAccessToken,
      token_expira_en: tokenStorage.tokenExpiresAt
    }
  })
}

export const createLinkedInSession = async ({
  token,
  usuarioId,
  fechaExpiracion
}: {
  token: string
  usuarioId: number
  fechaExpiracion: Date
}) => {
  return await createSession({
    token,
    usuarioId,
    fechaExpiracion,
    metodo_auth: 'linkedin'
  })
}

export const findLinkedInLinkByExternalId = async (linkedinId: string) => {
  return await findSocialLinkByProviderAndExternalId('linkedin', linkedinId)
}

export const findLinkedInLinkByUserId = async (usuarioId: number) => {
  return await findSocialLinkByUserAndProvider(usuarioId, 'linkedin')
}

export const createLinkedInLinkForUser = async ({
  usuarioId,
  linkedinId,
  correoProveedor,
  tokenStorage
}: {
  usuarioId: number
  linkedinId: string
  correoProveedor?: string | null
  tokenStorage: LinkedInTokenStorageInput
}) => {
  return await linkLinkedInToUser(usuarioId, linkedinId, correoProveedor ?? '', tokenStorage)
}

export const findUserByLinkedInSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateLinkedInLastUsage = async (
  usuarioId: number,
  linkedinId: string,
  tokenStorage: LinkedInTokenStorageInput
) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuarioId,
      proveedor: 'linkedin',
      idExterno: linkedinId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date(),
      token_acceso_cifrado: tokenStorage.encryptedAccessToken,
      token_expira_en: tokenStorage.tokenExpiresAt
    }
  })
}
