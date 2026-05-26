import { prisma } from '../../../lib/prisma.client.js'
import { createSession, createUser, findUserByCorreo } from '../auth.repository.js'

import {
  createSocialLink,
  findSocialLinkByProviderAndExternalId,
  findSocialLinkByUserAndProvider,
  findUserByActiveSessionTokenForSocialLink
} from '../auth.repository.js'

type CreateFacebookUserInput = {
  nombre: string
  apellido: string
  correo: string
  password: string
}

export const findUserByFacebookId = async (facebookId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: 'facebook',
      idExterno: facebookId,
      activo: true
    },
    include: {
      usuario: true
    }
  })

  return social?.usuario ?? null
}

export const findUserByFacebookEmail = async (correo: string) => {
  return await findUserByCorreo(correo)
}

export const createFacebookUser = async (
  data: CreateFacebookUserInput,
  facebookId: string,
  correo_proveedor: string
) => {
  const user = await createUser({
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    password: data.password
  })

  await prisma.autenticacion_social.create({
    data: {
      usuarioId: user.id,
      proveedor: 'facebook',
      idExterno: facebookId,
      correoProveedor: correo_proveedor,
      activo: true
    }
  })

  return user
}

export const linkFacebookToUser = async (
  usuarioId: number,
  facebookId: string,
  correo_proveedor: string | null
) => {
  return await prisma.autenticacion_social.create({
    data: {
      usuarioId,
      proveedor: 'facebook',
      idExterno: facebookId,
      correoProveedor: correo_proveedor,
      activo: true
    }
  })
}

export const createFacebookSession = async ({
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
    fechaExpiracion: fecha_expiracion
  })
}

export const findFacebookLinkByExternalId = async (facebookId: string) => {
  return await findSocialLinkByProviderAndExternalId('facebook', facebookId)
}

export const findFacebookLinkByUserId = async (usuarioId: number) => {
  return await findSocialLinkByUserAndProvider(usuarioId, 'facebook')
}

export const createFacebookLinkForUser = async ({
  usuarioId,
  facebookId,
  correo_proveedor
}: {
  usuarioId: number
  facebookId: string
  correo_proveedor?: string | null
}) => {
  return await createSocialLink({
    usuarioId,
    proveedor: 'facebook',
    idExterno: facebookId,
    correoProveedor: correo_proveedor
  })
}

export const findUserByFacebookSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateFacebookLastUsage = async (usuarioId: number, facebookId: string) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuarioId,
      proveedor: 'facebook',
      idExterno: facebookId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date()
    }
  })
}