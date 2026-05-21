'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type VerifyResponse = {
  message?: string
  token?: string
  user?: {
    nombre: string
    apellido: string
    correo: string
  }
}

export default function VerifyEmailPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

  const [codigo, setCodigo] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  useEffect(() => {
    const pendingToken = sessionStorage.getItem('pendingRegisterToken')
    const pendingPassword = sessionStorage.getItem('pendingRegisterPassword')
    const pendingEmail = sessionStorage.getItem('pendingRegisterEmail')

    if (!pendingToken || !pendingPassword || !pendingEmail) {
      router.replace('/sign-up')
      return
    }

    setEmail(pendingEmail)
  }, [router])

  const handleResend = async () => {
    const verificationToken = sessionStorage.getItem('pendingRegisterToken')
    if (!verificationToken) return

    setIsResending(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-register-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo reenviar el código')
      }

      // Actualizar el token y reiniciar temporizador
      sessionStorage.setItem('pendingRegisterToken', data.verificationToken)
      setTimeLeft(60)
      setCanResend(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al reenviar el código')
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const verificationToken = sessionStorage.getItem('pendingRegisterToken')
    const password = sessionStorage.getItem('pendingRegisterPassword')

    if (!verificationToken || !password) {
      setError('La verificación ya no es válida. Vuelve a registrarte.')
      return
    }

    if (!codigo.trim()) {
      setError('Ingresa el código de verificación.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationToken,
          codigo: codigo.trim(),
          password
        })
      })

      const data: VerifyResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo verificar el código')
      }

      if (!data.token || !data.user) {
        throw new Error('No se recibió una sesión válida')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem(
        'propbol_user',
        JSON.stringify({
          name: `${data.user.nombre} ${data.user.apellido}`,
          email: data.user.correo
        })
      )
      localStorage.setItem('propbol_session_expires', String(Date.now() + 60 * 60 * 1000))

      sessionStorage.removeItem('pendingRegisterToken')
      sessionStorage.removeItem('pendingRegisterPassword')
      sessionStorage.removeItem('pendingRegisterEmail')
      sessionStorage.setItem(
        'register_success_message',
        data.message || 'Correo verificado correctamente'
      )

      window.dispatchEvent(new Event('propbol:login'))
      window.dispatchEvent(new Event('propbol:session-changed'))

      router.replace('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo verificar el código')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    sessionStorage.removeItem('pendingRegisterToken')
    sessionStorage.removeItem('pendingRegisterPassword')
    sessionStorage.removeItem('pendingRegisterEmail')
    router.replace('/sign-up')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4">
      <div className="w-full max-w-sm rounded-md border border-[#e7e5e4] bg-white p-6 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-[#292524]">Verifica tu correo</h1>

        <p className="mt-3 text-center text-sm text-[#57534e]">
          Te enviamos un código a <strong>{email}</strong>.
        </p>

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div>
            <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-[#292524]">
              Código de verificación
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ingresa el código"
              maxLength={6}
              className="w-full rounded-md border border-[#d6d3d1] px-3 py-2 text-sm outline-none focus:border-[#D97706]"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            {isSubmitting ? 'Verificando...' : 'Verificar código'}
          </button>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-[#57534e]">
                ¿No recibiste el código? Reenviar en{' '}
                <span className="font-mono font-bold">
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 disabled:text-amber-300"
              >
                {isResending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="w-full rounded-md bg-[#292524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1c1917]"
          >
            Volver al registro
          </button>
        </form>
      </div>
    </div>
  )
}
