'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword } from '@/lib/validators/auth'

type FormData = {
  email: string
  firstName: string
  lastName: string
  phone: string
  password: string
  confirmPassword: string
}

type FormErrors = {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

const initialFormData: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

export default function SignUpForm() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value

      const value = field === 'email' ? rawValue.trimStart() : rawValue

      setFormData((prev) => ({
        ...prev,
        [field]: value
      }))

      if (field === 'email') {
        const emailError = validateEmail(value)

        setErrors((prev) => ({
          ...prev,
          email: emailError || undefined
        }))
      }

      if (field === 'password') {
        const passwordError = validatePassword(value)

        setErrors((prev) => ({
          ...prev,
          password: passwordError || undefined
        }))
      }
      if (field === 'confirmPassword') {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
          value !== formData.password
            ? 'Las contraseñas no coinciden'
            : undefined
        }))
      }
      if(field === 'phone'){
        const onlyNumbersRegex = /^[0-9]*$/
        setErrors((prev) => ({
          ...prev,
          phone: onlyNumbersRegex.test(value) ? undefined : 'El teléfono solo permite números'
        }))
      }

    }

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }))

    if (field === 'email') {
      const emailError = validateEmail(formData.email)

      setErrors((prev) => ({
        ...prev,
        email: emailError || undefined
      }))
    }

    if (field === 'password') {
      const passwordError = validatePassword(formData.password)

      setErrors((prev) => ({
        ...prev,
        password: passwordError || undefined
      }))
    }
    if (field === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
      confirmPasswordError :
        formData.confirmPassword !== formData.password
          ? 'Las contraseñas no coinciden'
          : undefined
      }))
    }
    if (field === 'phone') {
      const onlyNumbersRegex = /^[0-9]*$/
      setErrors((prev) => ({
        ...prev,
        phone: onlyNumbersRegex.test(formData.phone) ? undefined : 'El teléfono solo permite números'
      }))
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setErrors({})
    setTouched({})
    router.push('/')
  }

  const isFormValid = useMemo(() => {
    return formData.email.trim() 
    !== '' && !validateEmail(formData.email) && !validatePassword(formData.password) &&
    formData.confirmPassword === formData.password &&
    (formData.phone === '' || !errors.phone) 
  }, [formData.email, formData.password])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  const emailError = validateEmail(formData.email)
  const passwordError = validatePassword(formData.password)
  const confirmPasswordError =
    formData.confirmPassword !== formData.password
      ? 'Las contraseñas no coinciden'
      : undefined

  const newErrors: FormErrors = {
    email: emailError || undefined,
    password: passwordError || undefined,
    confirmPassword: confirmPasswordError || undefined
  }

  setErrors(newErrors)
  setTouched((prev) => ({
    ...prev,
    email: true,
    password: true,
    confirmPassword: true
  }))

  if (emailError || passwordError || confirmPasswordError) return

  console.log('Formulario listo para enviar', {
    ...formData,
    email: formData.email.trim()
  })
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-2xl font-bold text-slate-800">
        Registro
      </h2>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Correo electrónico
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          placeholder="Ingresa tu correo"
          className={`w-full rounded-md border px-4 py-3 outline-none transition ${
            touched.email && errors.email
              ? 'border-red-500'
              : 'border-slate-300 focus:border-orange-400'
          }`}
          aria-invalid={Boolean(touched.email && errors.email)}
          aria-describedby="email-error"
        />

        {touched.email && errors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="firstName"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Nombre
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          placeholder="Ingresa tu nombre"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
        />
      </div>

      <div>
        <label
          htmlFor="lastName"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Apellido
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          onBlur={handleBlur('lastName')}
          placeholder="Ingresa tu apellido"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          placeholder="Ingresa tu teléfono"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
        />
        {touched.phone && errors.phone ? (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          placeholder="Ingresa tu contraseña"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
        />
        {touched.password && errors.password ? (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          placeholder="Confirma tu contraseña"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-orange-400"
        />
        {touched.confirmPassword && errors.confirmPassword ? (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full rounded-md bg-orange-400 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Registrarse
      </button>

      <button
        type="button"
        onClick={handleCancel}
        className="w-full rounded-md bg-slate-700 px-4 py-3 font-semibold text-white"
      >
        Cancelar registro
      </button>

      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/sign-in" className="font-semibold text-orange-500">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}