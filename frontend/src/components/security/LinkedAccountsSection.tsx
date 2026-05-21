'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

type ProviderId = 'facebook' | 'discord' | 'google' | 'linkedin'
type AccountStatus = 'vinculado' | 'no-vinculado'

type LinkedAccount = {
  id: ProviderId
  platform: string
  description: string
  status: AccountStatus
  linkedEmail: string
  linkedAt?: string
  requiresReauthorization?: boolean
  color: string
  icon?: ReactNode
  letter?: string
}

type SocialLinksResponse = {
  facebook: {
    linked: boolean
    linkedEmail: string | null
    linkedAt: string | null
    requiresReauthorization?: boolean
  }
  discord: {
    linked: boolean
    linkedEmail: string | null
    linkedAt: string | null
    requiresReauthorization?: boolean
  }
  google: {
    linked: boolean
    linkedEmail: string | null
    linkedAt: string | null
    requiresReauthorization?: boolean
  }
  linkedin: {
    linked: boolean
    linkedEmail: string | null
    linkedAt: string | null
    requiresReauthorization?: boolean
  }
}

type SocialLinkPopupSuccess = {
  type: 'propbol:social-link-success'
  provider: ProviderId
  message: string
  linkedEmail: string | null
}

type SocialLinkPopupError = {
  type: 'propbol:social-link-error'
  provider: ProviderId
  code: string
  message: string
}

type SocialLinkPopupMessage = SocialLinkPopupSuccess | SocialLinkPopupError

const initialAccounts: LinkedAccount[] = [
  {
    id: 'google',
    platform: 'Google',
    description: 'Vincula tu cuenta de Google para iniciar sesión con un solo clic.',
    status: 'no-vinculado',
    linkedEmail: '',
    color: 'bg-red-500',
    letter: 'G'
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    description: 'Vincula tu cuenta de Facebook para iniciar sesión con un solo clic.',
    status: 'no-vinculado',
    linkedEmail: '',
    color: 'bg-blue-600',
    letter: 'f'
  },
  {
    id: 'discord',
    platform: 'Discord',
    description: 'Vincula tu cuenta de Discord para iniciar sesión con un solo clic.',
    status: 'no-vinculado',
    linkedEmail: '',
    color: 'bg-indigo-600',
    icon: <DiscordIcon />
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    description: 'Vincula tu cuenta de LinkedIn para iniciar sesión con un solo clic.',
    status: 'no-vinculado',
    linkedEmail: '',
    color: 'bg-[#0A66C2]',
    icon: <LinkedInIcon />
  }
]

const formatLinkedAt = (value?: string) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz'
  }).format(date)
}

type SocialCardProps = {
  account: LinkedAccount
  actionLoadingId: string | null
  onLink: (id: ProviderId) => void
  onOpenUnlinkModal: (id: ProviderId) => void
  disableUnlink: boolean
}

function SocialCard({
  account,
  actionLoadingId,
  onLink,
  onOpenUnlinkModal,
  disableUnlink
}: SocialCardProps) {
  const isProcessing = actionLoadingId === account.id
  const isLinked = account.status === 'vinculado'
  const requiresRenewal =
    isLinked && account.id === 'linkedin' && account.requiresReauthorization === true

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${account.color}`}
          >
            {account.icon ?? account.letter}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{account.platform}</h3>
            <p className="mt-1 text-sm text-neutral-500">{account.description}</p>

            <p className="mt-2 text-sm">
              <span className="font-medium text-neutral-700">Estado:</span>{' '}
              <span
                className={
                  isLinked ? 'font-semibold text-green-600' : 'font-semibold text-neutral-500'
                }
              >
                {isLinked ? 'Vinculado' : 'No vinculado'}
              </span>
            </p>

            {isLinked && (
              <p className="mt-1 text-sm text-neutral-500">
                {account.linkedEmail
                  ? `Cuenta asociada: ${account.linkedEmail}`
                  : 'Cuenta vinculada correctamente.'}
              </p>
            )}

            {isLinked && account.id === 'linkedin' && account.linkedAt && (
              <p className="mt-1 text-sm text-neutral-500">
                Fecha de vinculación: {formatLinkedAt(account.linkedAt)}
              </p>
            )}

            {requiresRenewal && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Tu autorización de LinkedIn expiró. Renueva el acceso para mantener la vinculación
                activa.
              </p>
            )}

            {isLinked && disableUnlink && !requiresRenewal && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Debes mantener al menos una red vinculada activa.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            requiresRenewal
              ? onLink(account.id)
              : isLinked
                ? onOpenUnlinkModal(account.id)
                : onLink(account.id)
          }
          disabled={isProcessing || (isLinked && disableUnlink && !requiresRenewal)}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
            requiresRenewal
              ? 'bg-[#0A66C2] hover:brightness-95'
              : isLinked
                ? 'bg-red-500 hover:bg-red-600'
                : account.id === 'facebook'
                  ? 'bg-[#1877F2] hover:brightness-95'
                  : account.id === 'discord' || account.id === 'google'
                    ? 'bg-[#5865F2] hover:brightness-95'
                    : 'bg-[#5865F2] hover:brightness-95'
          }`}
        >
          {isProcessing
            ? 'Procesando...'
            : requiresRenewal
              ? 'Renovar autorización'
              : isLinked
                ? 'Desvincular'
                : 'Vincular'}
        </button>
      </div>
    </article>
  )
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.191.328-.403.769-.552 1.117a18.27 18.27 0 0 0-5.333 0A11.64 11.64 0 0 0 9.448 3a19.736 19.736 0 0 0-4.433 1.369C2.211 8.58 1.443 12.686 1.826 16.735A19.923 19.923 0 0 0 7.239 19.5c.438-.6.828-1.235 1.164-1.904-.634-.24-1.239-.541-1.813-.896.152-.111.301-.227.445-.347 3.495 1.643 7.285 1.643 10.739 0 .146.12.294.236.446.347-.575.355-1.182.656-1.817.896.336.669.726 1.304 1.164 1.904a19.874 19.874 0 0 0 5.416-2.765c.451-4.695-.769-8.763-3.666-12.366ZM9.349 14.546c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.84 2.154-1.909 2.154Zm5.303 0c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.831 2.154-1.909 2.154Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const isSocialLinkPopupMessage = (value: unknown): value is SocialLinkPopupMessage => {
  if (!value || typeof value !== 'object') return false

  const message = value as { type?: unknown; provider?: unknown }

  return (
    (message.type === 'propbol:social-link-success' ||
      message.type === 'propbol:social-link-error') &&
    (message.provider === 'facebook' ||
      message.provider === 'discord' ||
      message.provider === 'google' ||
      message.provider === 'linkedin')
  )
}

export default function LinkedAccountsSection() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>(initialAccounts)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [accountToUnlink, setAccountToUnlink] = useState<ProviderId | null>(null)

  const linkedAccountsCount = useMemo(() => {
    return accounts.filter((account) => account.status === 'vinculado').length
  }, [accounts])

  const isLastLinkedAccount = (id: ProviderId) => {
    const account = accounts.find((item) => item.id === id)

    return account?.status === 'vinculado' && linkedAccountsCount <= 1
  }

  const fetchLinks = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setErrorMessage('No se encontró una sesión activa.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await fetch(`${API_URL}/api/auth/social-links`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || 'No se pudo cargar el estado de las redes vinculadas.')
      }

      const data = (await response.json()) as SocialLinksResponse

      setAccounts((prev) =>
        prev.map((account) => {
          const providerData = data[account.id]

          if (!providerData) return account

          return {
            ...account,
            status: providerData.linked ? 'vinculado' : 'no-vinculado',
            linkedEmail: providerData.linkedEmail ?? '',
            linkedAt: providerData.linkedAt ?? '',
            requiresReauthorization: providerData.requiresReauthorization ?? false
          }
        })
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el estado de las redes vinculadas.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchLinks()
  }, [])

  const handleLink = async (id: ProviderId) => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!navigator.onLine) {
      setErrorMessage('No tienes conexión a internet.')
      return
    }

    const current = accounts.find((account) => account.id === id)

    if (!current) return

    const isRenewal =
      current.id === 'linkedin' &&
      current.status === 'vinculado' &&
      current.requiresReauthorization === true

    const actionLabel = isRenewal ? 'renovación' : 'vinculación'

    if (current.status === 'vinculado' && !isRenewal) {
      setErrorMessage(`${current.platform} ya está vinculada.`)
      return
    }

    setActionLoadingId(id)

    try {
      const response = await fetch(`${API_URL}/api/auth/${id}/link-url`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
        }
      })

      const data = (await response.json()) as {
        url?: string
        message?: string
      }

      if (!response.ok || !data.url) {
        throw new Error(
          data.message || `No se pudo iniciar la ${actionLabel} con ${current.platform}.`
        )
      }

      const popupWidth = 500
      const popupHeight = 700
      const left = window.screenX + (window.outerWidth - popupWidth) / 2
      const top = window.screenY + (window.outerHeight - popupHeight) / 2

      const popupWindow = window.open(
        data.url,
        `${id}-link`,
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      )

      if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
        throw new Error(
          'El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.'
        )
      }

      const popup = popupWindow
      popup.focus()

      const expectedOrigin = new URL(API_URL).origin
      let flowResolved = false
      let intervalId = 0
      let timeoutId = 0

      const cleanup = () => {
        window.removeEventListener('message', handleMessage)
        window.clearInterval(intervalId)
        window.clearTimeout(timeoutId)
        setActionLoadingId(null)
      }

      const handleMessage = async (event: MessageEvent<SocialLinkPopupMessage>) => {
        if (event.origin !== expectedOrigin) return
        if (!isSocialLinkPopupMessage(event.data)) return
        if (
          event.data.type !== 'propbol:social-link-success' &&
          event.data.type !== 'propbol:social-link-error'
        ) {
          return
        }

        if (event.data.provider !== id) return

        flowResolved = true
        cleanup()

        if (event.data.type === 'propbol:social-link-success') {
          setSuccessMessage(event.data.message)
          popup.close()
          await fetchLinks()
          return
        }

        setErrorMessage(
          event.data.message || `No se pudo completar la ${actionLabel} con ${current.platform}.`
        )
        popup.close()
      }

      intervalId = window.setInterval(() => {
        if (!popup.closed) return

        cleanup()

        if (!flowResolved) {
          setErrorMessage(`Cancelaste la ${actionLabel} con ${current.platform}.`)
        }
      }, 500)

      timeoutId = window.setTimeout(
        () => {
          cleanup()

          if (!popup.closed) popup.close()

          if (!flowResolved) {
            setErrorMessage(
              `La ${actionLabel} con ${current.platform} tardó demasiado. Intenta nuevamente.`
            )
          }
        },
        2 * 60 * 1000
      )

      window.addEventListener('message', handleMessage)
    } catch (error) {
      setActionLoadingId(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `No se pudo completar la ${actionLabel} con ${current.platform}.`
      )
    }
  }

  const openUnlinkModal = (id: ProviderId) => {
    setErrorMessage('')
    setSuccessMessage('')

    if (isLastLinkedAccount(id)) {
      setErrorMessage('No puedes desvincular esta red porque es tu único método de acceso activo.')
      return
    }

    setAccountToUnlink(id)
  }

  const cancelUnlink = () => {
    setAccountToUnlink(null)
  }

  const confirmUnlink = async () => {
    if (!accountToUnlink) return

    if (!navigator.onLine) {
      setErrorMessage('No tienes conexión a internet.')
      setAccountToUnlink(null)
      return
    }

    const current = accounts.find((account) => account.id === accountToUnlink)

    if (!current) {
      setAccountToUnlink(null)
      return
    }

    if (isLastLinkedAccount(accountToUnlink)) {
      setErrorMessage('No puedes desvincular esta red porque es tu único método de acceso activo.')
      setAccountToUnlink(null)
      return
    }

    setActionLoadingId(accountToUnlink)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_URL}/api/auth/social-links/${accountToUnlink}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
        }
      })

      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo desvincular la red social.')
      }

      setSuccessMessage(data.message || 'La red social fue desvinculada correctamente.')
      setAccountToUnlink(null)
      await fetchLinks()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : `No se pudo desvincular ${current.platform}.`
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Redes vinculadas</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Gestiona las redes sociales vinculadas a tu cuenta para un inicio de sesión más rápido.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">Cargando redes...</p>

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200" />

                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
                  <div className="h-3 w-48 animate-pulse rounded bg-neutral-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
                </div>
              </div>

              <div className="h-10 w-28 animate-pulse rounded-lg bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <SocialCard
              key={account.id}
              account={account}
              actionLoadingId={actionLoadingId}
              onLink={handleLink}
              onOpenUnlinkModal={openUnlinkModal}
              disableUnlink={isLastLinkedAccount(account.id)}
            />
          ))}
        </div>
      )}

      {accountToUnlink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-stone-800">Confirmar desvinculación</h4>
            <p className="mt-2 text-sm text-stone-500">
              ¿Seguro que deseas desvincular esta red social de tu cuenta?
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelUnlink}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmUnlink}
                disabled={actionLoadingId === accountToUnlink}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoadingId === accountToUnlink ? 'Procesando...' : 'Desvincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
