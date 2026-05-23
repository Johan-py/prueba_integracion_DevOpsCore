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
      id_externo: facebookId,
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
      usuario_id: user.id,
      proveedor: 'facebook',
      id_externo: facebookId,
      correo_proveedor,
      activo: true
    }
  })

  return user
}

export const linkFacebookToUser = async (
  usuario_id: number,
  facebookId: string,
  correo_proveedor: string | null
) => {
  return await prisma.autenticacion_social.create({
    data: {
      usuario_id,
      proveedor: 'facebook',
      id_externo: facebookId,
      correo_proveedor,
      activo: true
    }
  })
}

export const createFacebookSession = async ({
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

export const findFacebookLinkByExternalId = async (facebookId: string) => {
  return await findSocialLinkByProviderAndExternalId('facebook', facebookId)
}

export const findFacebookLinkByUserId = async (usuario_id: number) => {
  return await findSocialLinkByUserAndProvider(usuario_id, 'facebook')
}

export const createFacebookLinkForUser = async ({
  usuario_id,
  facebookId,
  correo_proveedor
}: {
  usuario_id: number
  facebookId: string
  correo_proveedor?: string | null
}) => {
  return await createSocialLink({
    usuario_id,
    proveedor: 'facebook',
    id_externo: facebookId,
    correo_proveedor
  })
}

export const findUserByFacebookSessionToken = async (sessionToken: string) => {
  return await findUserByActiveSessionTokenForSocialLink(sessionToken)
}

export const updateFacebookLastUsage = async (usuario_id: number, facebookId: string) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuario_id,
      proveedor: 'facebook',
      id_externo: facebookId,
      activo: true
    },
    data: {
      ultimo_uso_en: new Date()
    }
  })
}

