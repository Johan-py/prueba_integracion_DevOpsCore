'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff, Mail, User, Phone, Lock } from 'lucide-react'
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

interface RegisterResponse {
  message: string
  token?: string
}

const initialFormData: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

function getInputClasses(hasError?: boolean, hasRightIcon?: boolean) {
  return [
    'w-full rounded-xl border bg-[#ffffff] pl-11 py-3 outline-none',
    hasRightIcon ? 'pr-12' : 'pr-4',
    'text-sm text-[#292524] placeholder:text-[#78716c] transition-all duration-200',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-[#e7e5e4] focus:border-[#D97706] focus:ring-2 focus:ring-amber-100'
  ].join(' ')
}

function FieldError({
  id,
  error
}: {
  id: string
  error?: string
}) {
  if (!error) return null

  return (
    <p id={id} className="mt-2 text-sm text-red-600">
      {error}
    </p>
  )
}

function FieldLabel({
  htmlFor,
  children
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-[#292524]"
    >
      {children}
    </label>
  )
}

export default function SignUpForm() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  const onlyNumbersRegex = /^[0-9]*$/

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

      if (field === 'firstName') {
        setErrors((prev) => ({
          ...prev,
          firstName:
            value.trim() === ''
              ? 'El campo no puede estar vacío'
              : onlyLettersRegex.test(value)
                ? undefined
                : 'El nombre solo puede contener letras'
        }))
      }

      if (field === 'lastName') {
        setErrors((prev) => ({
          ...prev,
          lastName:
            value.trim() === ''
              ? 'El campo no puede estar vacío'
              : onlyLettersRegex.test(value)
                ? undefined
                : 'El apellido solo puede contener letras'
        }))
      }

      if (field === 'phone') {
        setErrors((prev) => ({
          ...prev,
          phone:
            value.trim() === ''
              ? 'El campo no puede estar vacío'
              : onlyNumbersRegex.test(value)
                ? undefined
                : 'El teléfono solo permite números'
        }))
      }

      if (field === 'password') {
        const passwordError = validatePassword(value)

        setErrors((prev) => ({
          ...prev,
          password: passwordError || undefined,
          confirmPassword:
            formData.confirmPassword.trim() === ''
              ? prev.confirmPassword
              : formData.confirmPassword !== value
                ? 'Las contraseñas no coinciden'
                : undefined
        }))
      }

      if (field === 'confirmPassword') {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value.trim() === ''
              ? 'El campo no puede estar vacío'
              : value !== formData.password
                ? 'Las contraseñas no coinciden'
                : undefined
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

    if (field === 'firstName') {
      setErrors((prev) => ({
        ...prev,
        firstName:
          formData.firstName.trim() === ''
            ? 'El campo no puede estar vacío'
            : onlyLettersRegex.test(formData.firstName)
              ? undefined
              : 'El nombre solo puede contener letras'
      }))
    }

    if (field === 'lastName') {
      setErrors((prev) => ({
        ...prev,
        lastName:
          formData.lastName.trim() === ''
            ? 'El campo no puede estar vacío'
            : onlyLettersRegex.test(formData.lastName)
              ? undefined
              : 'El apellido solo puede contener letras'
      }))
    }

    if (field === 'phone') {
      setErrors((prev) => ({
        ...prev,
        phone:
          formData.phone.trim() === ''
            ? 'El campo no puede estar vacío'
            : onlyNumbersRegex.test(formData.phone)
              ? undefined
              : 'El teléfono solo permite números'
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
        confirmPassword:
          formData.confirmPassword.trim() === ''
            ? 'El campo no puede estar vacío'
            : formData.confirmPassword !== formData.password
              ? 'Las contraseñas no coinciden'
              : undefined
      }))
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setErrors({})
    setTouched({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setServerMessage('')
    setServerError('')
    setIsSubmitting(false)
    router.push('/')
  }

  const isFormValid = useMemo(() => {
    const requiredFieldsCompleted =
      formData.email.trim() !== '' &&
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== ''

    return (
      requiredFieldsCompleted &&
      !validateEmail(formData.email) &&
      !validatePassword(formData.password) &&
      onlyLettersRegex.test(formData.firstName) &&
      onlyLettersRegex.test(formData.lastName) &&
      onlyNumbersRegex.test(formData.phone) &&
      formData.confirmPassword === formData.password
    )
  }, [formData])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setServerMessage('')
    setServerError('')

    if (isSubmitting) return

    const emailError = validateEmail(formData.email)

    const firstNameError =
      formData.firstName.trim() === ''
        ? 'El campo no puede estar vacío'
        : onlyLettersRegex.test(formData.firstName)
          ? undefined
          : 'El nombre solo puede contener letras'

    const lastNameError =
      formData.lastName.trim() === ''
        ? 'El campo no puede estar vacío'
        : onlyLettersRegex.test(formData.lastName)
          ? undefined
          : 'El apellido solo puede contener letras'

    const passwordError = validatePassword(formData.password)

    const confirmPasswordError =
      formData.confirmPassword.trim() === ''
        ? 'El campo no puede estar vacío'
        : formData.confirmPassword !== formData.password
          ? 'Las contraseñas no coinciden'
          : undefined

    const phoneError =
      formData.phone.trim() === ''
        ? 'El campo no puede estar vacío'
        : onlyNumbersRegex.test(formData.phone)
          ? undefined
          : 'El teléfono solo permite números'

    const newErrors: FormErrors = {
      email: emailError || undefined,
      firstName: firstNameError,
      lastName: lastNameError,
      phone: phoneError,
      password: passwordError || undefined,
      confirmPassword: confirmPasswordError || undefined
    }

    setErrors(newErrors)
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      password: true,
      confirmPassword: true
    })

    if (
      emailError ||
      firstNameError ||
      lastNameError ||
      passwordError ||
      confirmPasswordError ||
      phoneError
    ) {
      return
    }

    const payload = {
      nombre: formData.firstName.trim(),
      apellido: formData.lastName.trim(),
      correo: formData.email.trim().toLowerCase(),
      telefono: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim()
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      let data: RegisterResponse | null = null

      try {
        data = (await response.json()) as RegisterResponse
      } catch {
        data = null
      }

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo completar el registro')
      }

      if (data?.token) {
        localStorage.setItem('token', data.token)
      }

      setServerMessage(data?.message || 'Usuario registrado correctamente')

      setTimeout(() => {
        router.replace('/')
      }, 1500)
    } catch (error) {
      const message =
        error instanceof TypeError
          ? 'No hay conexión a internet o no se pudo conectar con el servidor'
          : error instanceof Error
            ? error.message
            : 'No se pudo completar el registro'

      setServerError(message)
      console.error('Error al registrar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[#ffffff] px-8 py-10 shadow-sm">
          <h1 className="mb-8 text-center text-4xl font-bold text-[#292524]">
            Registro
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {serverMessage ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {serverMessage}
              </p>
            ) : null}

            {serverError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </p>
            ) : null}

            <div>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Ingresa tu correo"
                  className={getInputClasses(Boolean(touched.email && errors.email))}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby="email-error"
                />
              </div>
              <FieldError
                id="email-error"
                error={touched.email ? errors.email : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  placeholder="Ingresa tu nombre"
                  maxLength={30}
                  className={getInputClasses(Boolean(touched.firstName && errors.firstName))}
                  aria-invalid={Boolean(touched.firstName && errors.firstName)}
                  aria-describedby="firstName-error"
                />
              </div>
              <FieldError
                id="firstName-error"
                error={touched.firstName ? errors.firstName : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  placeholder="Ingresa tu apellido"
                  maxLength={30}
                  className={getInputClasses(Boolean(touched.lastName && errors.lastName))}
                  aria-invalid={Boolean(touched.lastName && errors.lastName)}
                  aria-describedby="lastName-error"
                />
              </div>
              <FieldError
                id="lastName-error"
                error={touched.lastName ? errors.lastName : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  placeholder="Ingresa tu teléfono"
                  maxLength={20}
                  className={getInputClasses(Boolean(touched.phone && errors.phone))}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby="phone-error"
                />
              </div>
              <FieldError
                id="phone-error"
                error={touched.phone ? errors.phone : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Ingresa tu contraseña"
                  maxLength={255}
                  className={getInputClasses(
                    Boolean(touched.password && errors.password),
                    true
                  )}
                  aria-invalid={Boolean(touched.password && errors.password)}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#292524]"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError
                id="password-error"
                error={touched.password ? errors.password : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="confirmPassword">
                Confirmar contraseña
              </FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  placeholder="Confirma tu contraseña"
                  maxLength={255}
                  className={getInputClasses(
                    Boolean(touched.confirmPassword && errors.confirmPassword),
                    true
                  )}
                  aria-invalid={Boolean(
                    touched.confirmPassword && errors.confirmPassword
                  )}
                  aria-describedby="confirmPassword-error"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#292524]"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmación de contraseña'
                      : 'Mostrar confirmación de contraseña'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <FieldError
                id="confirmPassword-error"
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-[#e7e5e4] bg-[#ffffff] px-4 py-3 text-base font-semibold text-[#292524] transition hover:bg-[#f5f5f4]"
              >
                Cancelar registro
              </button>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`rounded-xl px-4 py-3 text-base font-semibold transition ${
                  isFormValid && !isSubmitting
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'cursor-not-allowed bg-[#e7e5e4] text-[#78716c]'
                }`}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>

            <p className="text-center text-sm text-[#78716c]">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/sign-in"
                className="font-semibold text-[#D97706] transition hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}