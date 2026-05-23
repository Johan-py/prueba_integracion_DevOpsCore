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
      id_externo: linkedinId,
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
  correo_proveedor: string,
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
        usuario_id: user.id,
        proveedor: 'linkedin',
        id_externo: linkedinId,
        correo_proveedor,
        activo: true,
        vinculado_en: new Date(),
        ultimo_uso_en: new Date(),
        token_acceso_cifrado: tokenStorage.encryptedAccessToken,
        token_expira_en: tokenStorage.tokenExpiresAt
      }
    })

    return user
  })
}

export const linkLinkedInToUser = async (
  usuario_id: number,
  linkedinId: string,
  correo_proveedor: string,
  tokenStorage: LinkedInTokenStorageInput
) => {
  const existingLink = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'linkedin',
      id_externo: linkedinId
    }
  })

  if (existingLink) {
    return await prisma.autenticacion_social.update({
      where: {
        id: existingLink.id
      },
      data: {
        usuario_id,
        correo_proveedor,
        activo: true,
        vinculado_en: new Date(),
        ultimo_uso_en: new Date(),
        token_acceso_cifrado: tokenStorage.encryptedAccessToken,
        token_expira_en: tokenStorage.tokenExpiresAt
      }
    })
  }

  return await prisma.autenticacion_social.create({
    data: {
      usuario_id,
      proveedor: 'linkedin',
      id_externo: linkedinId,
      correo_proveedor,
      activo: true,
      vinculado_en: new Date(),
      ultimo_uso_en: new Date(),
      token_acceso_cifrado: tokenStorage.encryptedAccessToken,
      token_expira_en: tokenStorage.tokenExpiresAt
    }
  })
}

export const createLinkedInSession = async ({
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
    fecha_expiracion,
    metodo_auth: 'linkedin'
  })
}

export const findLinkedInLinkByExternalId = async (linkedinId: string) => {
  return await findSocialLinkByProviderAndExternalId('linkedin', linkedinId)
}

export const findLinkedInLinkByUserId = async (usuario_id: number) => {
  return await findSocialLinkByUserAndProvider(usuario_id, 'linkedin')
}

export const createLinkedInLinkForUser = async ({
  usuario_id,
  linkedinId,
  correo_proveedor,
  tokenStorage
}: {
  usuario_id: number
  linkedinId: string
  correo_proveedor?: string | null
  tokenStorage: LinkedInTokenStorageInput
}) => {
  return await linkLinkedInToUser(usuario_id, linkedinId, correo_proveedor ?? '', tokenStorage)
}

export const findUserByLinkedInSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateLinkedInLastUsage = async (
  usuario_id: number,
  linkedinId: string,
  tokenStorage: LinkedInTokenStorageInput
) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuario_id,
      proveedor: 'linkedin',
      id_externo: linkedinId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date(),
      token_acceso_cifrado: tokenStorage.encryptedAccessToken,
      token_expira_en: tokenStorage.tokenExpiresAt
    }
  })
}

