'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type LoginResponse = {
  message?: string
  token?: string
  user?: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
  }
}

type GoogleAuthMessage = {
  source?: string
  type?: 'GOOGLE_AUTH_SUCCESS' | 'GOOGLE_AUTH_ERROR'
  token?: string
  user?: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
  }
  error?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const LOGIN_TIMEOUT_MS = 10000

export default function LoginForm() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  const googlePopupRef = useRef<Window | null>(null)
  const googleAuthResolvedRef = useRef(false)

  const isFormValid = correo.length > 0 && password.length > 0 && !errors.correo && !errors.password

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors }

    if (field === 'correo') {
      if (!value) {
        newErrors.correo = 'El correo es obligatorio'
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.correo = 'Formato de correo inválido'
      } else {
        delete newErrors.correo
      }
    }

    if (field === 'password') {
      if (!value) {
        newErrors.password = 'La contraseña es obligatoria'
      } else if (value.length > 16) {
        newErrors.password = 'La contraseña no puede tener más de 16 caracteres'
      } else {
        delete newErrors.password
      }
    }

    setErrors(newErrors)
  }

  useEffect(() => {
    const handleGoogleAuthMessage = (event: MessageEvent<GoogleAuthMessage>) => {
      if (event.origin !== API_URL) {
        return
      }

      const data = event.data

      if (!data || data.source !== 'propbol-google-auth') {
        return
      }

      googleAuthResolvedRef.current = true
      setIsLoadingGoogle(false)
      setGoogleError('')

      if (data.type === 'GOOGLE_AUTH_SUCCESS' && data.token && data.user) {
        localStorage.setItem('token', data.token)

        const userName =
          data.user.nombre && data.user.apellido
            ? `${data.user.nombre} ${data.user.apellido}`
            : data.user.correo

        localStorage.setItem(
          'propbol_user',
          JSON.stringify({
            name: userName,
            email: data.user.correo
          })
        )

        localStorage.setItem('propbol_session_expires', String(Date.now() + 60 * 60 * 1000))

        window.dispatchEvent(new Event('propbol:login'))
        window.dispatchEvent(new Event('propbol:session-changed'))

        router.push('/')
        return
      }

      if (data.type === 'GOOGLE_AUTH_ERROR') {
        setGoogleError(data.error || 'No se pudo iniciar sesión con Google.')
      }
    }

    window.addEventListener('message', handleGoogleAuthMessage)

    return () => {
      window.removeEventListener('message', handleGoogleAuthMessage)
    }
  }, [router])

  const handleGoogleLogin = () => {
    setGoogleError('')
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoadingGoogle(true)
    googleAuthResolvedRef.current = false

    const popup = window.open(
      `${API_URL}/api/auth/google/login`,
      'google-login',
      'width=500,height=600'
    )

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setGoogleError(
        'El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.'
      )
      setIsLoadingGoogle(false)
      return
    }

    googlePopupRef.current = popup

    const checkPopup = setInterval(() => {
      if (!googlePopupRef.current) {
        clearInterval(checkPopup)
        return
      }

      if (googlePopupRef.current.closed) {
        clearInterval(checkPopup)
        googlePopupRef.current = null
        setIsLoadingGoogle(false)

        if (!googleAuthResolvedRef.current) {
          setGoogleError('Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.')
        }
      }
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedCorreo = correo.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const newErrors: { correo?: string; password?: string } = {}

    if (!trimmedCorreo) {
      newErrors.correo = 'El correo es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(trimmedCorreo)) {
      newErrors.correo = 'Formato de correo inválido'
    }

    if (!trimmedPassword) {
      newErrors.password = 'La contraseña es obligatoria'
    }

    setErrors(newErrors)
    setErrorMessage('')
    setSuccessMessage('')
    setGoogleError('')

    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      controller.abort()
    }, LOGIN_TIMEOUT_MS)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo: trimmedCorreo,
          password: trimmedPassword
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setPassword('')

        if (response.status === 404) {
          setErrorMessage(
            'Esta cuenta no está registrada. Puedes registrarte para crear una cuenta.'
          )
          return
        }

        setErrorMessage(data.message || 'Error al iniciar sesión')
        return
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      const userName =
        data.user?.nombre && data.user?.apellido
          ? `${data.user.nombre} ${data.user.apellido}`
          : (data.user?.correo ?? trimmedCorreo)

      localStorage.setItem(
        'propbol_user',
        JSON.stringify({
          name: userName,
          email: data.user?.correo ?? trimmedCorreo
        })
      )
      localStorage.setItem('propbol_session_expires', String(Date.now() + 60 * 60 * 1000))

      setSuccessMessage(data.message || 'Inicio de sesión exitoso')

      window.dispatchEvent(new Event('propbol:login'))
      window.dispatchEvent(new Event('propbol:session-changed'))

      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      clearTimeout(timeoutId)
      setPassword('')

      if (error instanceof Error && error.name === 'AbortError') {
        setErrorMessage('La solicitud tardó demasiado. Por favor intenta nuevamente.')
      } else {
        setErrorMessage('No se pudo conectar con el servidor')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>

          <input
            type="email"
            required
            placeholder="Ingresa tu correo electrónico"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              validate('correo', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />

          {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Ingresa tu contraseña"
              value={password}
              maxLength={16}
              onChange={(e) => {
                setPassword(e.target.value)
                validate('password', e.target.value)
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {errorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
            !isFormValid || isLoading
              ? 'cursor-not-allowed bg-orange-300'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-base font-bold">G</span>
          {isLoadingGoogle ? 'Autenticando...' : 'Continuar con Google'}
        </button>

        {googleError && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {googleError}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push('/')}
          className="mx-auto block w-fit rounded-md bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Cancelar Inicio de sesión
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link href="/sign-up" className="font-semibold text-orange-500 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}