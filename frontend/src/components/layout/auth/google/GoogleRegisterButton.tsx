'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google?: GoogleNamespace
  }
}

interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GoogleMomentNotification {
  isDismissedMoment: () => boolean
  getDismissedReason: () => string
  isNotDisplayed: () => boolean
  getNotDisplayedReason: () => string
  isSkippedMoment: () => boolean
  getSkippedReason: () => string
}

interface GoogleInitializeConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void | Promise<void>
  moment_callback?: (notification: GoogleMomentNotification) => void
  ux_mode?: 'popup' | 'redirect'
  locale?: string
  cancel_on_tap_outside?: boolean
}

interface GoogleRenderButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
  locale?: string
}

interface GoogleAccountsId {
  initialize: (config: GoogleInitializeConfig) => void
  renderButton: (parent: HTMLElement, options: GoogleRenderButtonOptions) => void
  prompt: () => void
  disableAutoSelect: () => void
}

interface GoogleNamespace {
  accounts: {
    id: GoogleAccountsId
  }
}

type GoogleRegisterButtonProps = {
  onCredentialReceived: (credential: string) => void | Promise<void>
  onError?: (message: string) => void
  disabled?: boolean
}

const SCRIPT_ID = 'google-identity-services-script'
const GOOGLE_SELECTION_TIMEOUT_MS = 15000

export default function GoogleRegisterButton({
  onCredentialReceived,
  onError,
  disabled = false
}: GoogleRegisterButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [localError, setLocalError] = useState('')
  const router = useRouter()

  const selectionTimeoutRef = useRef<number | null>(null)
  const hasTimedOutRef = useRef(false)
  const isWaitingForCredentialRef = useRef(false)

  const setErrorMessage = (message: string) => {
    setLocalError(message)
    onError?.(message)
  }

  const clearErrorMessage = () => {
    setLocalError('')
    onError?.('')
  }

  const clearSelectionTimeout = () => {
    if (selectionTimeoutRef.current !== null) {
      window.clearTimeout(selectionTimeoutRef.current)
      selectionTimeoutRef.current = null
    }
  }

  const resetSelectionState = () => {
    clearSelectionTimeout()
    hasTimedOutRef.current = false
    isWaitingForCredentialRef.current = false
  }

  const startSelectionTimeout = () => {
    if (disabled) return

    clearSelectionTimeout()
    clearErrorMessage()

    hasTimedOutRef.current = false
    isWaitingForCredentialRef.current = true

    selectionTimeoutRef.current = window.setTimeout(() => {
      hasTimedOutRef.current = true
      isWaitingForCredentialRef.current = false

      setErrorMessage(
        'Se agotó el tiempo para seleccionar una cuenta de Google. Intenta nuevamente.'
      )

      router.replace('/sign-up')
    }, GOOGLE_SELECTION_TIMEOUT_MS)
  }

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      setErrorMessage('Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID')
      return
    }

    const renderGoogleButton = () => {
      if (!containerRef.current || !window.google) return

      containerRef.current.innerHTML = ''

      window.google.accounts.id.disableAutoSelect()

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: GoogleCredentialResponse) => {
          clearSelectionTimeout()
          isWaitingForCredentialRef.current = false

          if (hasTimedOutRef.current) {
            return
          }

          if (!response.credential) {
            setErrorMessage('Google no devolvió una credencial válida')
            return
          }

          clearErrorMessage()
          await onCredentialReceived(response.credential)
        },
        moment_callback: (notification: GoogleMomentNotification) => {
          const wasDismissed =
            notification.isDismissedMoment() &&
            (notification.getDismissedReason() === 'credential_returned' ||
              notification.getDismissedReason() === 'cancel_called' ||
              notification.getDismissedReason() === 'flow_restarted')

          if (notification.isDismissedMoment() && !wasDismissed) {
            clearSelectionTimeout()
            isWaitingForCredentialRef.current = false
            router.replace('/sign-up')
          }

          if (notification.isSkippedMoment()) {
            clearSelectionTimeout()
            isWaitingForCredentialRef.current = false
          }

          if (notification.isNotDisplayed()) {
            clearSelectionTimeout()
            isWaitingForCredentialRef.current = false
            setErrorMessage('No se pudo mostrar la ventana de Google. Intenta nuevamente.')
          }
        },
        ux_mode: 'popup',
        locale: 'es',
        cancel_on_tap_outside: true
      })

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: containerRef.current.offsetWidth || 300,
        locale: 'es'
      })
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton()

      return () => {
        clearSelectionTimeout()
      }
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton)

      return () => {
        clearSelectionTimeout()
        existingScript.removeEventListener('load', renderGoogleButton)
      }
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    script.onerror = () => {
      setErrorMessage('No se pudo cargar Google Identity Services')
    }

    document.head.appendChild(script)

    return () => {
      clearSelectionTimeout()
      script.removeEventListener('load', renderGoogleButton)
    }
  }, [onCredentialReceived, onError, router])

  return (
    <div className="space-y-1">
      <div
        className={disabled ? 'pointer-events-none opacity-60' : ''}
        aria-disabled={disabled}
        onClickCapture={startSelectionTimeout}
      >
        <div ref={containerRef} className="w-full" />
      </div>

      {localError ? <p className="text-[11px] text-red-500">{localError}</p> : null}
    </div>
  )
}
