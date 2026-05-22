import {
  countActiveSocialLinksByUser,
  deactivateSocialLinkByUserAndProvider,
  findSocialLinkByUserAndProvider,
  listSocialLinksByUser,
  invalidateOtherSessionsByAuthMethod
} from '../auth.repository.js'

const SUPPORTED_PROVIDERS = ['facebook', 'discord', 'google', 'linkedin'] as const

export const getSocialLinksService = async (usuarioId: number) => {
  const links = await listSocialLinksByUser(usuarioId)

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
      linkedEmail: facebook?.correoProveedor ?? null,
      linkedAt: facebook?.vinculadoEn?.toISOString() ?? null,
      requiresReauthorization: false
    },
    discord: {
      linked: Boolean(discord),
      linkedEmail: discord?.correoProveedor ?? null,
      linkedAt: discord?.vinculadoEn?.toISOString() ?? null,
      requiresReauthorization: false
    },
    google: {
      linked: Boolean(google),
      linkedEmail: google?.correoProveedor ?? null,
      linkedAt: google?.vinculadoEn?.toISOString() ?? null,
      requiresReauthorization: false
    },
    linkedin: {
      linked: Boolean(linkedin),
      linkedEmail: linkedin?.correoProveedor ?? null,
      linkedAt: linkedin?.vinculadoEn?.toISOString() ?? null,
      requiresReauthorization: isLinkedInTokenExpired
    }
  }
}

export const unlinkSocialProviderService = async (
  usuarioId: number,
  provider: string,
  currentToken: string
) => {
  if (!SUPPORTED_PROVIDERS.includes(provider as (typeof SUPPORTED_PROVIDERS)[number])) {
    throw new Error('Proveedor no soportado.')
  }

  const existingLink = await findSocialLinkByUserAndProvider(usuarioId, provider)

  if (!existingLink) {
    throw new Error('La red social no está vinculada.')
  }

  const activeLinksCount = await countActiveSocialLinksByUser(usuarioId)

  if (activeLinksCount <= 1) {
    throw new Error('No puedes desvincular esta red porque es tu único método de acceso activo.')
  }

  await deactivateSocialLinkByUserAndProvider(usuarioId, provider)

  if (provider === 'linkedin') {
    await invalidateOtherSessionsByAuthMethod(usuarioId, 'linkedin', currentToken)
  }

  return {
    message: 'La red social fue desvinculada correctamente.',
    provider
  }
}

export const getLinkedInOriginalEmail = async (usuarioId: number) => {
  const link = await findSocialLinkByUserAndProvider(usuarioId, 'linkedin')
  if (!link) return null
  return link.correoProveedor ?? null
}
