'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errors, setErrors] = useState<{
    email?: string
    nombre?: string
    apellido?: string
    telefono?: string
    password?: string
    confirmPassword?: string
  }>({})

  const isFormValid =
    email.trim().length > 0 &&
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    telefono.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !errors.email &&
    !errors.nombre &&
    !errors.apellido &&
    !errors.telefono &&
    !errors.password &&
    !errors.confirmPassword

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors }

    if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'El correo es obligatorio'
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Formato de correo inválido'
      } else {
        delete newErrors.email
      }
    }

    if (field === 'nombre') {
      if (!value.trim()) {
        newErrors.nombre = 'El nombre es obligatorio'
      } else {
        delete newErrors.nombre
      }
    }

    if (field === 'apellido') {
      if (!value.trim()) {
        newErrors.apellido = 'El apellido es obligatorio'
      } else {
        delete newErrors.apellido
      }
    }

    if (field === 'telefono') {
      if (!value.trim()) {
        newErrors.telefono = 'El teléfono es obligatorio'
      } else if (!/^\d+$/.test(value)) {
        newErrors.telefono = 'Solo se permiten números'
      } else {
        delete newErrors.telefono
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

      if (confirmPassword && value !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      } else if (confirmPassword) {
        delete newErrors.confirmPassword
      }
    }

    if (field === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Debes confirmar la contraseña'
      } else if (value !== password) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      } else {
        delete newErrors.confirmPassword
      }
    }

    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedNombre = nombre.trim()
    const trimmedApellido = apellido.trim()
    const trimmedTelefono = telefono.trim()

    setEmail(trimmedEmail)
    setNombre(trimmedNombre)
    setApellido(trimmedApellido)
    setTelefono(trimmedTelefono)

    validate('email', trimmedEmail)
    validate('nombre', trimmedNombre)
    validate('apellido', trimmedApellido)
    validate('telefono', trimmedTelefono)
    validate('password', password)
    validate('confirmPassword', confirmPassword)

    console.log({
      email: trimmedEmail,
      nombre: trimmedNombre,
      apellido: trimmedApellido,
      telefono: trimmedTelefono,
      password,
      confirmPassword
    })
  }

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Crear cuenta</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
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
            Nombre
          </label>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              validate('nombre', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            placeholder="Ingresa tu apellido"
            value={apellido}
            onChange={(e) => {
              setApellido(e.target.value)
              validate('apellido', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {errors.apellido && (
            <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="text"
            placeholder="Ingresa tu teléfono"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value)
              validate('telefono', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {errors.telefono && (
            <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            maxLength={16}
            onChange={(e) => {
              setPassword(e.target.value)
              validate('password', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <input
            type="password"
            placeholder="Confirma tu contraseña"
            value={confirmPassword}
            maxLength={16}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              validate('confirmPassword', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
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
          Registrarse
        </button>

        <button
          type="button"
          className="w-full rounded-md bg-gray-700 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Cancelar registro
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-orange-500 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}