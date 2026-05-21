'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const LINKEDIN_TIMEOUT_MS = 2 * 60 * 1000

type LinkedInRegisterSuccessPayload = {
  type: 'propbol:linkedin-login-success'
  message: string
  token: string
  user: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
    avatar?: string | null
  }
}

type Props = {
  onSuccess: (payload: LinkedInRegisterSuccessPayload) => Promise<void>
  onError: (message: string) => void
  disabled?: boolean
}

export default function LinkedInRegisterButton({ onSuccess, onError, disabled = false }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (disabled || isLoading) return

    onError('')
    setIsLoading(true)

    if (!navigator.onLine) {
      onError('Sin conexión a internet. Verifica tu red e intenta nuevamente.')
      setIsLoading(false)
      return
    }

    const popupWidth = 500
    const popupHeight = 600
    const left = window.screenX + (window.outerWidth - popupWidth) / 2
    const top = window.screenY + (window.outerHeight - popupHeight) / 2

    const popupWindow = window.open(
      `${API_URL}/api/auth/linkedin/register`,
      'linkedin-register',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
    )

    if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
      onError('El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.')
      setIsLoading(false)
      return
    }

    const popup = popupWindow
    popup.focus()

    const expectedOrigin = new URL(API_URL).origin
    let authWasResolved = false
    let checkIntervalId = 0
    let timeoutId = 0

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener('message', handleMessage)
      window.clearInterval(checkIntervalId)
      window.clearTimeout(timeoutId)
      if (shouldStopLoading) setIsLoading(false)
    }

    async function handleMessage(event: MessageEvent) {
      if (event.origin !== expectedOrigin) return

      const data = event.data
      if (
        !data ||
        typeof data !== 'object' ||
        !('type' in data) ||
        (data.type !== 'propbol:linkedin-login-success' &&
          data.type !== 'propbol:linkedin-login-error')
      )
        return

      authWasResolved = true
      cleanup(false)

      if (data.type === 'propbol:linkedin-login-success') {
        try {
          await onSuccess(data as LinkedInRegisterSuccessPayload)
        } catch {
          onError('No se pudo guardar la sesión iniciada con LinkedIn.')
        } finally {
          setIsLoading(false)
          popup.close()
        }
        return
      }

      if (data.type === 'propbol:linkedin-login-error' && data.code === 'LINKEDIN_REVOKED') {
        popup.close()
        setIsLoading(false)
        onError(
          'Tu autorización con LinkedIn fue revocada. Se abrirá nuevamente para que la restaures.'
        )
        setTimeout(() => handleClick(), 1200)
        return
      }

      onError(data.message || 'No se pudo completar el registro con LinkedIn.')
      setIsLoading(false)
      popup.close()
    }

    let wasTimeout = false

    checkIntervalId = window.setInterval(() => {
      if (!popup.closed) return
      cleanup()
      if (!authWasResolved && !wasTimeout) {
        onError('Cancelaste el registro con LinkedIn. Puedes intentarlo nuevamente.')
      }
    }, 500)

    timeoutId = window.setTimeout(() => {
      wasTimeout = true
      cleanup()
      if (!popup.closed) popup.close()
      if (!authWasResolved) {
        onError('El tiempo de autorización con LinkedIn expiró. Por favor, inténtalo nuevamente.')
      }
    }, LINKEDIN_TIMEOUT_MS)

    window.addEventListener('message', handleMessage)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0A66C2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#004182] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      {isLoading ? 'Conectando con LinkedIn...' : 'Registrarse con LinkedIn'}
    </button>
  )
}
