'use client'

import { FormEvent, useState } from 'react'

type SubmitState = {
  type: 'idle' | 'success' | 'error'
  message: string
}

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export default function DevNotificacionesPage() {
  const [correo, setCorreo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>({
    type: 'idle',
    message: ''
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const token = localStorage.getItem('token')

    if (!token) {
      setSubmitState({
        type: 'error',
        message: 'No se encontró token. Primero inicia sesión.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitState({
      type: 'idle',
      message: ''
    })

    try {
      const response = await fetch(`${getApiBaseUrl()}/notificaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          correo,
          titulo,
          mensaje
        })
      })

      const data = (await response.json().catch(() => null)) as {
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo crear la notificación.')
      }

      setSubmitState({
        type: 'success',
        message: data?.message || 'Notificación creada correctamente.'
      })

      setCorreo('')
      setTitulo('')
      setMensaje('')
    } catch (error) {
      setSubmitState({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo crear la notificación.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10">
      <section className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">Enviar notificación de prueba</h1>

        <p className="mt-2 text-sm text-stone-600">
          Inserta una notificación usando el correo del destinatario.
        </p>

        {submitState.type !== 'idle' ? (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              submitState.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-700'
                : 'border border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {submitState.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="correo" className="mb-1 block text-sm font-medium text-stone-700">
              Correo del destinatario
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
              placeholder="usuario@gmail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-stone-700">
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
              placeholder="Título de la notificación"
              required
            />
          </div>

          <div>
            <label htmlFor="mensaje" className="mb-1 block text-sm font-medium text-stone-700">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500"
              placeholder="Mensaje de la notificación"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Crear notificación'}
          </button>
        </form>
      </section>
    </main>
  )
}
