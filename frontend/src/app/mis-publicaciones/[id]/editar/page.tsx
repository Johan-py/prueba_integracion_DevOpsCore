'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EditarMultimediaModal from '@/components/publicacion/EditarMultimediaModal'
import {
  editarPublicacion,
  obtenerDetallePublicacion
} from '@/services/publicacion.service'
import type {
  EditarPublicacionPayload,
  PublicacionDetalle
} from '@/types/publicacion'

type FormState = {
  titulo: string
  descripcion: string
  precio: string
  tipoAccion: 'VENTA' | 'ALQUILER' | 'ANTICRETO'
  ubicacion: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const validarFormulario = (form: FormState): FormErrors => {
  const errores: FormErrors = {}

  const titulo = form.titulo.trim()
  const descripcion = form.descripcion.trim()
  const ubicacion = form.ubicacion.trim()
  const precio = form.precio.trim()

  if (titulo.length < 20 || titulo.length > 80) {
    errores.titulo = 'El título debe tener entre 20 y 80 caracteres'
  } else if (!/^[a-zA-Z0-9\s]+$/.test(titulo)) {
    errores.titulo = 'El título solo puede contener caracteres alfanuméricos'
  }

  if (descripcion.length < 50 || descripcion.length > 300) {
    errores.descripcion = 'La descripción debe tener entre 50 y 300 caracteres'
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()]+$/.test(descripcion)) {
    errores.descripcion =
      'La descripción solo puede contener caracteres alfanuméricos y básicos'
  }

  if (!ubicacion) {
    errores.ubicacion = 'La dirección es obligatoria'
  }

  if (!precio || Number(precio) <= 0) {
    errores.precio = 'El precio debe ser un número positivo'
  } else if (precio.replace('.', '').length > 9) {
    errores.precio = 'El precio no puede exceder los 9 dígitos'
  }

  return errores
}

export default function EditarPublicacionPage() {
  const params = useParams()
  const router = useRouter()

  const publicacionId = Number(params.id)

  const [form, setForm] = useState<FormState>({
    titulo: '',
    descripcion: '',
    precio: '',
    tipoAccion: 'VENTA',
    ubicacion: ''
  })

  const [detallePublicacion, setDetallePublicacion] =
    useState<PublicacionDetalle | null>(null)

  const [mostrarModalMultimedia, setMostrarModalMultimedia] = useState(false)
  const [originalForm, setOriginalForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setLoading(true)
        setError('')

        const detalle = await obtenerDetallePublicacion(publicacionId)

        const formCargado: FormState = {
          titulo: detalle.titulo ?? '',
          descripcion: detalle.descripcion ?? '',
          precio: detalle.precio ? String(detalle.precio) : '',
          tipoAccion: detalle.tipoOperacion ?? 'VENTA',
          ubicacion: detalle.ubicacionTexto ?? ''
        }

        setDetallePublicacion(detalle)
        setForm(formCargado)
        setOriginalForm(formCargado)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la publicación'
        )
      } finally {
        setLoading(false)
      }
    }

    if (!Number.isNaN(publicacionId) && publicacionId > 0) {
      void cargarDetalle()
    } else {
      setLoading(false)
      setError('El id de la publicación es inválido')
    }
  }, [publicacionId])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }))

    setError('')
    setSuccess('')
  }

  const hayCambiosPendientes = () => {
    return originalForm
      ? JSON.stringify(form) !== JSON.stringify(originalForm)
      : false
  }

  useEffect(() => {
    const protegerSalidaEditarPublicacion = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      const elementoNavegable = target.closest('a, button') as
        | HTMLAnchorElement
        | HTMLButtonElement
        | null

      if (!elementoNavegable) return

      const estaDentroDelFormulario = elementoNavegable.closest('form')

      if (estaDentroDelFormulario) return

      const href =
        elementoNavegable instanceof HTMLAnchorElement
          ? elementoNavegable.getAttribute('href')
          : null

      const textoBoton =
        elementoNavegable.textContent?.trim().toLowerCase() ?? ''

      const esLinkValido =
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        href !== window.location.pathname

      const esBotonDeNavegacion =
        textoBoton.includes('propbol') ||
        textoBoton.includes('propiedades') ||
        textoBoton.includes('blogs') ||
        textoBoton.includes('planes') ||
        textoBoton.includes('ayuda') ||
        textoBoton.includes('publica tu inmueble') ||
        textoBoton.includes('mi cuenta') ||
        textoBoton.includes('mis propiedades vistas') ||
        textoBoton.includes('mis favoritos') ||
        textoBoton.includes('mis publicaciones') ||
        textoBoton.includes('mis zonas') ||
        textoBoton.includes('mis comparaciones') ||
        textoBoton.includes('seguridad') ||
        textoBoton.includes('cerrar sesión') ||
        textoBoton.includes('contacto') ||
        textoBoton.includes('términos') ||
        textoBoton.includes('terminos') ||
        textoBoton.includes('privacidad') ||
        textoBoton.includes('política') ||
        textoBoton.includes('politica') ||
        textoBoton.includes('facebook') ||
        textoBoton.includes('instagram') ||
        textoBoton.includes('twitter') ||
        textoBoton.includes('linkedin')

      if (esLinkValido || esBotonDeNavegacion) {
        const confirmar = window.confirm(
          '¿Estás seguro que quieres salirte sin editar nada?'
        )

        if (!confirmar) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
        }
      }
    }

    document.addEventListener('click', protegerSalidaEditarPublicacion, true)

    return () => {
      document.removeEventListener(
        'click',
        protegerSalidaEditarPublicacion,
        true
      )
    }
  }, [])

  useEffect(() => {
    const estadoActual = window.history.state

    window.history.pushState(estadoActual, '', window.location.href)

    const protegerBotonAtras = () => {
      if (hayCambiosPendientes()) {
        const confirmar = window.confirm(
          '¿Estás seguro que quieres salirte sin editar nada?'
        )

        if (!confirmar) {
          window.history.pushState(
            window.history.state,
            '',
            window.location.href
          )
          return
        }
      }

      window.removeEventListener('popstate', protegerBotonAtras)
      window.history.back()
    }

    window.addEventListener('popstate', protegerBotonAtras)

    return () => {
      window.removeEventListener('popstate', protegerBotonAtras)
    }
  }, [form, originalForm])

  useEffect(() => {
    const protegerRecargaOCierre = (event: BeforeUnloadEvent) => {
      if (hayCambiosPendientes()) {
        event.preventDefault()
        event.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', protegerRecargaOCierre)

    return () => {
      window.removeEventListener('beforeunload', protegerRecargaOCierre)
    }
  }, [form, originalForm])

  const handleCancelar = () => {
    if (hayCambiosPendientes()) {
      const confirmar = window.confirm(
        'Hay cambios sin guardar. ¿Deseas descartarlos?'
      )

      if (!confirmar) return
    }

    router.push('/mis-publicaciones')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    const errores = validarFormulario(form)
    setFieldErrors(errores)

    if (Object.keys(errores).length > 0) {
      setError('Corrige los campos marcados antes de guardar')
      return
    }

    if (!hayCambiosPendientes()) {
      setError('No se detectaron cambios')
      return
    }

    try {
      setSaving(true)

      const payload: EditarPublicacionPayload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        tipoAccion: form.tipoAccion,
        ubicacion: form.ubicacion.trim()
      }

      await editarPublicacion(publicacionId, payload)

      setSuccess('Publicación actualizada correctamente')
      setOriginalForm(form)

      setTimeout(() => {
        router.push('/mis-publicaciones')
        router.refresh()
      }, 900)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la publicación'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="px-4 py-8">Cargando datos de la publicación...</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-black">
          Editar publicación
        </h1>

        <button
          type="button"
          onClick={() => setMostrarModalMultimedia(true)}
          className="rounded-lg border border-[#D97706] bg-white px-4 py-2 text-sm font-semibold text-[#D97706] transition hover:bg-orange-50"
        >
          Editar imágenes y video
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[#e6ddd1] bg-[#F9F6EE] p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Título
          </label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            minLength={20}
            maxLength={80}
            className={`w-full rounded-lg border px-4 py-3 outline-none focus:border-[#D97706] ${
              fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.titulo && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.titulo}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Debe tener entre 20 y 80 caracteres. Solo letras, números y
            espacios.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={5}
            minLength={50}
            maxLength={300}
            className={`w-full rounded-lg border px-4 py-3 outline-none focus:border-[#D97706] ${
              fieldErrors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.descripcion && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.descripcion}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Debe tener entre 50 y 300 caracteres. Se permiten letras, números,
            espacios y signos básicos.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Tipo de operación
          </label>
          <select
            name="tipoAccion"
            value={form.tipoAccion}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
          >
            <option value="VENTA">VENTA</option>
            <option value="ALQUILER">ALQUILER</option>
            <option value="ANTICRETO">ANTICRETO</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Ubicación
          </label>
          <input
            type="text"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-3 outline-none focus:border-[#D97706] ${
              fieldErrors.ubicacion ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.ubicacion && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.ubicacion}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            La dirección es obligatoria.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Precio
          </label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            min="1"
            step="0.01"
            className={`w-full rounded-lg border px-4 py-3 outline-none focus:border-[#D97706] ${
              fieldErrors.precio ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.precio && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.precio}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Debe ser un número positivo y no puede exceder los 9 dígitos.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCancelar}
            className="h-11 flex-1 rounded-lg border border-[#9a9a9a] bg-white text-[14px] font-medium text-[#2c2c2c] transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-11 flex-1 rounded-lg bg-[#D97706] text-[14px] font-medium text-white transition hover:bg-[#bf6905] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

          {detallePublicacion && (
            <EditarMultimediaModal
    open={mostrarModalMultimedia}
    publicacionId={publicacionId}
    imagenesActuales={
      detallePublicacion.imagenes?.map((imagen) =>
        typeof imagen === 'string' ? imagen : imagen.url
      ) ?? []
    }
    videoActual={detallePublicacion.videoUrl}
    videoUrlsActuales={
     detallePublicacion.videoUrls?.filter(
    (video): video is string => typeof video === 'string' && video.trim() !== ''
     ) ??
     (detallePublicacion.videoUrl ? [detallePublicacion.videoUrl] : [])
   }
    onClose={() => setMostrarModalMultimedia(false)}
    onSaved={async () => {
      const detalleActualizado =
        await obtenerDetallePublicacion(publicacionId)

      setDetallePublicacion(detalleActualizado)
      setMostrarModalMultimedia(false)
      router.refresh()
    }}
  />
)}
    </div>
  )
}