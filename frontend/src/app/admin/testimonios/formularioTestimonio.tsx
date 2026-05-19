'use client'

import { useState } from 'react'

type TestimonioFormData = {
  nombreUsuario: string
  apellidoUsuario: string
  departamento: string
  zonaBarrio: string
  categoria: string
  texto: string
  activo: boolean
  calificacion: number
}

type FormularioTestimoniosProps = {
  onCreate?: (testimonio: TestimonioFormData & { id: number; likes: number }) => void
}

export default function FormularioTestimonios({ onCreate }: FormularioTestimoniosProps) {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [apellidoUsuario, setApellidoUsuario] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [zonaBarrio, setZonaBarrio] = useState('')
  const [categoria, setCategoria] = useState('')
  const [texto, setTexto] = useState('')
  const [activo, setActivo] = useState(true)
  const [calificacion, setCalificacion] = useState(5)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setNombreUsuario('')
    setApellidoUsuario('')
    setDepartamento('')
    setZonaBarrio('')
    setCategoria('')
    setTexto('')
    setActivo(true)
    setCalificacion(5)
    setErrors({})
    setServerError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors: Record<string, string> = {}

    if (!nombreUsuario.trim()) {
      validationErrors.nombreUsuario = 'Nombre de usuario es obligatorio.'
    }

    if (!departamento.trim()) {
      validationErrors.departamento = 'Departamento es obligatorio.'
    }

    if (!texto.trim()) {
      validationErrors.texto = 'El comentario es obligatorio.'
    }

    if (!categoria.trim()) {
      validationErrors.categoria = 'Categoría es obligatoria.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
      }

      const response = await fetch(`${apiUrl}/api/admin/testimonios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comentario: texto.trim(),
          ciudad: departamento.trim(),
          zona: zonaBarrio.trim(),
          categoria: categoria.trim(),
          visible: activo,
          nombreAutor: nombreUsuario.trim(),
          apellidoAutor: apellidoUsuario.trim(),
          calificacion: calificacion
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Error al crear testimonio')
      }

      onCreate?.(data)
      setSuccessMessage('Testimonio creado correctamente.')
      resetForm()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al crear testimonio'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-amber-100/40 border border-amber-100 mb-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-600">Nuevo testimonio</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Crear testimonio</h2>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Completa los datos para agregar una reseña destacada en la sección de testimonios.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          onClick={resetForm}
        >
          Limpiar
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Nombre de usuario</span>
            <input
              value={nombreUsuario}
              onChange={(event) => setNombreUsuario(event.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
              placeholder="Ej. Ana"
            />
            {errors.nombreUsuario && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.nombreUsuario}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Apellido (opcional)</span>
            <input
              value={apellidoUsuario}
              onChange={(event) => setApellidoUsuario(event.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
              placeholder="Ej. Pérez"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Departamento</span>
            <select
              value={departamento}
              onChange={(event) => setDepartamento(event.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
            >
              <option value="">Selecciona un departamento</option>
              <option value="La Paz">La Paz</option>
              <option value="Cochabamba">Cochabamba</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Oruro">Oruro</option>
              <option value="Potosí">Potosí</option>
              <option value="Tarija">Tarija</option>
              <option value="Chuquisaca">Chuquisaca</option>
              <option value="Beni">Beni</option>
              <option value="Pando">Pando</option>
            </select>
            {errors.departamento && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.departamento}</p>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Zona / Barrio</span>
            <input
              value={zonaBarrio}
              onChange={(event) => setZonaBarrio(event.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
              placeholder="Ej. Equipetrol"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Categoría</span>
            <input
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
              placeholder="Ej. Cliente satisfecho"
            />
            {errors.categoria && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.categoria}</p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Comentario</span>
          <textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
            placeholder="Escribe el testimonio aquí..."
          />
          {errors.texto && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.texto}</p>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold text-stone-700 mb-2">Calificación</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCalificacion(num)}
                  className={`h-9 w-9 rounded-lg border text-sm font-bold transition-all ${
                    calificacion >= num
                      ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100 mt-2 sm:mt-0 sm:col-span-2">
            <input
              type="checkbox"
              id="new-activo"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
              className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="new-activo" className="text-sm font-semibold text-stone-700 cursor-pointer">
              Visible
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar testimonio'}
          </button>

          {successMessage && (
            <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
          )}
        </div>
        {serverError && (
          <p className="text-sm font-medium text-red-600">{serverError}</p>
        )}
      </form>
    </div>
  )
}
