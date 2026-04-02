'use client'

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

interface GoogleInitializeConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void | Promise<void>
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
}

interface GoogleNamespace {
  accounts: {
    id: GoogleAccountsId
  }
}

type GoogleRegisterButtonProps = {
  onCredentialReceived: (credential: string) => void | Promise<void>
  disabled?: boolean
}

const SCRIPT_ID = 'google-identity-services-script'

export default function GoogleRegisterButton({
  onCredentialReceived,
  disabled = false
}: GoogleRegisterButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      setLocalError('Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID')
      return
    }

    const renderGoogleButton = () => {
      if (!containerRef.current || !window.google) return

      containerRef.current.innerHTML = ''

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setLocalError('Google no devolvió una credencial válida')
            return
          }

          setLocalError('')
          await onCredentialReceived(response.credential)
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
      return
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton)
      return () => {
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
      setLocalError('No se pudo cargar Google Identity Services')
    }

    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', renderGoogleButton)
    }
  }, [onCredentialReceived])

  return (
    <div className="space-y-1">
      <div className={disabled ? 'pointer-events-none opacity-60' : ''} aria-disabled={disabled}>
        <div ref={containerRef} className="w-full" />
      </div>

      {localError ? <p className="text-[11px] text-red-500">{localError}</p> : null}
    </div>
  )
}
