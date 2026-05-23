import {
  countActiveSocialLinksByUser,
  deactivateSocialLinkByUserAndProvider,
  findSocialLinkByUserAndProvider,
  listSocialLinksByUser,
  invalidateOtherSessionsByAuthMethod
} from '../auth.repository.js'

const SUPPORTED_PROVIDERS = ['facebook', 'discord', 'google', 'linkedin'] as const

export const getSocialLinksService = async (usuario_id: number) => {
  const links = await listSocialLinksByUser(usuario_id)

  const facebook = links.find((item) => item.proveedor === 'facebook')
  const discord = links.find((item) => item.proveedor === 'discord')
  const google = links.find((item) => item.proveedor === 'google')
  const linkedin = links.find((item) => item.proveedor === 'linkedin')

  const linkedInTokenExpiresAt = linkedin?.token_expira_en
    ? new Date(linkedin.token_expira_en)
    : null

  const isLinkedInTokenExpired =
    linkedInTokenExpiresAt !== null && linkedInTokenExpiresAt.getTime() <= Date.now()

  return {
    facebook: {
      linked: Boolean(facebook),
      linkedEmail: facebook?.correo_proveedor ?? null,
      linkedAt: facebook?.vinculado_en?.toISOString() ?? null,
      requiresReauthorization: false
    },
    discord: {
      linked: Boolean(discord),
      linkedEmail: discord?.correo_proveedor ?? null,
      linkedAt: discord?.vinculado_en?.toISOString() ?? null,
      requiresReauthorization: false
    },
    google: {
      linked: Boolean(google),
      linkedEmail: google?.correo_proveedor ?? null,
      linkedAt: google?.vinculado_en?.toISOString() ?? null,
      requiresReauthorization: false
    },
    linkedin: {
      linked: Boolean(linkedin),
      linkedEmail: linkedin?.correo_proveedor ?? null,
      linkedAt: linkedin?.vinculado_en?.toISOString() ?? null,
      requiresReauthorization: isLinkedInTokenExpired
    }
  }
}

export const unlinkSocialProviderService = async (
  usuario_id: number,
  provider: string,
  currentToken: string
) => {
  if (!SUPPORTED_PROVIDERS.includes(provider as (typeof SUPPORTED_PROVIDERS)[number])) {
    throw new Error('Proveedor no soportado.')
  }

  const existingLink = await findSocialLinkByUserAndProvider(usuario_id, provider)

  if (!existingLink) {
    throw new Error('La red social no está vinculada.')
  }

  const activeLinksCount = await countActiveSocialLinksByUser(usuario_id)

  if (activeLinksCount <= 1) {
    throw new Error('No puedes desvincular esta red porque es tu único método de acceso activo.')
  }

  await deactivateSocialLinkByUserAndProvider(usuario_id, provider)

  if (provider === 'linkedin') {
    await invalidateOtherSessionsByAuthMethod(usuario_id, 'linkedin', currentToken)
  }

  return {
    message: 'La red social fue desvinculada correctamente.',
    provider
  }
}

export const getLinkedInOriginalEmail = async (usuario_id: number) => {
  const link = await findSocialLinkByUserAndProvider(usuario_id, 'linkedin')
  if (!link) return null
  return link.correo_proveedor ?? null
}

