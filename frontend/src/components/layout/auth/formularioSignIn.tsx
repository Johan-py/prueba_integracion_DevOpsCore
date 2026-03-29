'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const isFormValid =
    email.length > 0 &&
    password.length > 0 &&
    !errors.email &&
    !errors.password

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors }

    if (field === 'email') {
      if (!value) {
        newErrors.email = 'El correo es obligatorio'
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Formato de correo inválido'
      } else {
        delete newErrors.email
      }
    }

    if (field === 'password') {
      if (!value) {
        newErrors.password = 'La contraseña es obligatoria'
      } else if (value.length > 16) {
        newErrors.password = 'La contraseña no puede tener mas de 16 caracteres'
      } else {
        delete newErrors.password
      }
    }

    setErrors(newErrors)
  }

const fakeLogin = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 1000)) // simula espera

  if (email === 'test@test.com' && password === '123456') {
    return {
      ok: true,
      data: { token: 'fake-jwt' },
    }
  }

  return {
    ok: false,
    message: 'Credenciales incorrectas',
  }
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const trimmedEmail = email.trim()

  const newErrors: { email?: string; password?: string } = {}

  // Validación manual segura
  if (!trimmedEmail) {
    newErrors.email = 'El correo es obligatorio'
  } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
    newErrors.email = 'Formato de correo inválido'
  }

  if (!password) {
    newErrors.password = 'La contraseña es obligatoria'
  }

  setErrors(newErrors)

  //  la validación real
  if (Object.keys(newErrors).length > 0) return

  try {
    const result = await fakeLogin(trimmedEmail, password)

    if (!result.ok) {
      setPassword('') // 🔥 limpieza correcta
      setErrors({
        password: 'Credenciales incorrectas'
      })
      return
    }

    console.log('Login exitoso', result.data)

  } catch (error) {
    setPassword('')
    alert('Error inesperado')
  }
}

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              validate('email', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>

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

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
            isFormValid
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'cursor-not-allowed bg-orange-300'
          }`}
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="text-base font-bold">G</span>
          Continuar con Google
        </button>

        <button
          type="button"
          className="mx-auto block w-fit rounded-md bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Cancelar Inicio de sesión
        </button>
        </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-orange-500 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}