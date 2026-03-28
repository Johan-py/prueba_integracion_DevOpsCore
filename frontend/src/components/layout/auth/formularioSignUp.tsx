'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          password: passwordError || undefined,
          confirmPassword:
            formData.confirmPassword && formData.confirmPassword !== value
              ? 'Las contraseñas no coinciden'
              : undefined
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

      if (field === 'phone') {
  const onlyNumbersRegex = /^[0-9]*$/

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
      if (field === 'firstName') {
        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
        setErrors((prev) => ({
          ...prev,
          firstName: value === '' || !soloLetrasRegex.test(value)
          ? undefined
          : 'El nombre solo puede contener letras'
  }))
}

if (field === 'lastName') {
  const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  setErrors((prev) => ({
    ...prev,
    lastName: value === '' || soloLetrasRegex.test(value)
      ? undefined
      : 'El apellido solo puede contener letras'
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
        confirmPassword:
          formData.confirmPassword !== formData.password
            ? 'Las contraseñas no coinciden'
            : undefined
      }))
    }

    if (field === 'phone') {
      const onlyNumbersRegex = /^[0-9]*$/

      setErrors((prev) => ({
        ...prev,
        phone: onlyNumbersRegex.test(formData.phone)
          ? undefined
          : 'El teléfono solo permite números'
      }))
    }
    if (field === 'firstName') {
      const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
      setErrors((prev) => ({
      ...prev,
      firstName: formData.firstName === '' || soloLetrasRegex.test(formData.firstName)
      ? undefined
      : 'El nombre solo puede contener letras'

  }))
}

if (field === 'lastName') {
  const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  setErrors((prev) => ({
    ...prev,
    lastName:
      formData.lastName === '' || soloLetrasRegex.test(formData.lastName)
      ? undefined
      : 'El apellido solo puede contener letras'
  }))
}

if (field === 'phone') {
  const onlyNumbersRegex = /^[0-9]*$/

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
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setErrors({})
    setTouched({})
    setShowPassword(false)
    setShowConfirmPassword(false)
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
      formData.confirmPassword === formData.password &&
      !errors.phone
    )
  }, [formData, errors.phone])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  const emailError = validateEmail(formData.email)

  const firstNameError =
    formData.firstName.trim() === '' ? 'El campo no puede estar vacío' : undefined

  const lastNameError =
    formData.lastName.trim() === '' ? 'El campo no puede estar vacío' : undefined

  const passwordError = validatePassword(formData.password)

  const confirmPasswordError =
    formData.confirmPassword.trim() === ''
      ? 'El campo no puede estar vacío'
      : formData.confirmPassword !== formData.password
        ? 'Las contraseñas no coinciden'
        : undefined

  const onlyNumbersRegex = /^[0-9]*$/
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
       className={`w-full rounded-md border px-4 py-3 outline-none transition ${
       touched.lastName && errors.lastName
       ? 'border-red-500'
       : 'border-slate-300 focus:border-orange-400'
        }`}
        aria-invalid={Boolean(touched.lastName && errors.lastName)}
        aria-describedby="lastName-error"
       />

     {touched.lastName && errors.lastName ? (
     <p id="lastName-error" className="mt-1 text-sm text-red-600">
     {errors.lastName}
     </p>
     ) : null}
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
       className={`w-full rounded-md border px-4 py-3 outline-none transition ${
       touched.phone && errors.phone
      ? 'border-red-500'
      : 'border-slate-300 focus:border-orange-400'
      }`}
      aria-invalid={Boolean(touched.phone && errors.phone)}
      aria-describedby="phone-error"
     />

{touched.phone && errors.phone ? (
  <p id="phone-error" className="mt-1 text-sm text-red-600">
    {errors.phone}
  </p>
) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            placeholder="Ingresa tu contraseña"
            className="w-full rounded-md border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-orange-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

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

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            placeholder="Confirma tu contraseña"
            className="w-full rounded-md border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-orange-400"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-label={
              showConfirmPassword
                ? 'Ocultar confirmación de contraseña'
                : 'Mostrar confirmación de contraseña'
            }
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {touched.confirmPassword && errors.confirmPassword ? (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword}
          </p>
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