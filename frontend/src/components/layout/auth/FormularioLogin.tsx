'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Correo electrónico
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              ✉
            </span>
            <input
              id="email"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔒
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-10 text-sm outline-none transition focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="text-base font-bold text-gray-800">G</span>
          Continuar con Google
        </button>

        <button
          type="button"
          className="w-full rounded-md bg-gray-700 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Cancelar Inicio de sesión
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="font-semibold text-orange-500 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}