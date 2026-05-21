'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

type NotificationPreferences = {
  email: boolean
  whatsapp: boolean
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    whatsapp: false,
  })
  const [savedPreferences, setSavedPreferences] = useState<NotificationPreferences>({
    email: true,
    whatsapp: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tieneCorreo, setTieneCorreo] = useState(true)
  const [tieneTelefono, setTieneTelefono] = useState(false)
  const [warning, setWarning] = useState<'email' | 'whatsapp' | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    let mounted = true

    Promise.all([
      fetch(`${API_URL}/api/perfil/usuario/preferencias-notificacion`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/api/perfil/usuario`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([dataPreferencias, dataPerfil]) => {
        if (!mounted) return

        const tieneTelefonoReal = dataPerfil?.perfil?.telefonos?.length > 0

        setTieneCorreo(true)
        setTieneTelefono(tieneTelefonoReal)

        if (dataPreferencias.ok && dataPreferencias.preferencias) {
          const whatsappFinal = dataPreferencias.preferencias.whatsapp && tieneTelefonoReal

          setPreferences({
            email: dataPreferencias.preferencias.email,
            whatsapp: whatsappFinal
          })
          setSavedPreferences({
            email: dataPreferencias.preferencias.email,
            whatsapp: whatsappFinal
          })

          if (dataPreferencias.preferencias.whatsapp && !tieneTelefonoReal) {
            setWarning('whatsapp')
          }
        }
      })
      .catch(() => setErrorMessage('No se pudieron cargar tus preferencias.'))
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => { mounted = false }
  }, [])

  const hasChanges = useMemo(
    () =>
      preferences.email !== savedPreferences.email ||
      preferences.whatsapp !== savedPreferences.whatsapp,
    [preferences, savedPreferences]
  )

  const togglePreference = (key: keyof NotificationPreferences) => {
    setWarning(null)

    if (key === 'whatsapp' && !preferences.whatsapp && !tieneTelefono) {
      setWarning('whatsapp')
      return
    }
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
    setShowMessage(false)
    setErrorMessage(null)
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setIsSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`${API_URL}/api/perfil/usuario/preferencias-notificacion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.msg ?? 'Error al guardar')
      }

      setSavedPreferences(preferences)
      setShowMessage(true)
    } catch {
      setErrorMessage('No se pudieron guardar tus preferencias. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setPreferences(savedPreferences)
    setShowMessage(false)
    setErrorMessage(null)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9F6EE]">
        <p className="text-stone-500">Cargando preferencias...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F9F6EE] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Configuración de notificaciones
          </h1>
          <p className="mt-3 text-base text-stone-500 sm:text-lg">
            Administra cómo deseas recibir las alertas y avisos de tu cuenta
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-stone-900">
            ¿Cómo deseas recibir las notificaciones?
          </h2>

          <div className="mt-8 space-y-4">
            <PreferenceCard
              icon={<Mail className="h-9 w-9 text-stone-400 sm:h-10 sm:w-10" />}
              title="Correo electrónico"
              description="Recibir notificaciones en tu email registrado"
              checked={preferences.email}
              onToggle={() => togglePreference('email')}
            />
            <PreferenceCard
              icon={<MessageCircle className="h-9 w-9 text-green-500 sm:h-10 sm:w-10" />}
              title="WhatsApp"
              description="Recibir notificaciones por WhatsApp"
              checked={preferences.whatsapp}
              onToggle={() => togglePreference('whatsapp')}
            />
          </div>

          <div className="mt-16 border-t border-stone-200 pt-6">
            {warning === 'whatsapp' && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No tienes un número de teléfono registrado.{' '}
                <a href="/profile" className="font-semibold underline">
                  Regístralo en tu perfil
                </a>{' '}
                para activar notificaciones por WhatsApp.
              </div>
            )}
            {warning === 'email' && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No tienes un correo válido registrado.{' '}
                <a href="/profile" className="font-semibold underline">
                  Actualízalo en tu perfil
                </a>{' '}
                para activar notificaciones por Email.
              </div>
            )}
            {showMessage && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Preferencias guardadas correctamente.
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white px-8 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

type PreferenceCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}

function PreferenceCard({ icon, title, description, checked, onToggle }: PreferenceCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm transition hover:shadow-md sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-stone-900 sm:text-xl">{title}</h3>
          <p className="mt-1 text-sm text-stone-500 sm:text-base">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-11 w-20 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-amber-500' : 'bg-stone-300'
        }`}
      >
        <span
          className={`inline-block h-9 w-9 transform rounded-full bg-white shadow-md transition ${
            checked ? 'translate-x-10' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
} 