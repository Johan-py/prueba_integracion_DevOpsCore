'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type EditarMultimediaModalProps = {
  open: boolean
  publicacionId: number
  imagenesActuales: string[]
  videoActual?: string | null
  videoUrlsActuales?: string[]
  onClose: () => void
  onSaved: () => void | Promise<void>
}

const LIMITE_IMAGENES = 5
const LIMITE_VIDEOS = 2

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el archivo .env.local')
  }

  return apiUrl
}

const getToken = () => {
  if (typeof window === 'undefined') return ''

  return (
    localStorage.getItem('token') ??
    sessionStorage.getItem('token') ??
    localStorage.getItem('jwt') ??
    sessionStorage.getItem('jwt') ??
    ''
  )
}

const convertirArchivoABase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(String(reader.result))
    }

    reader.onerror = () => {
      reject(new Error('No se pudo leer la imagen'))
    }

    reader.readAsDataURL(file)
  })
}

const esVideoPermitido = (url: string) => {
  const video = url.trim().toLowerCase()

  if (!video) return true

  return (
    video.includes('youtube.com') ||
    video.includes('youtu.be') ||
    video.includes('vimeo.com')
  )
}

const leerRespuesta = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const texto = await response.text()

  throw new Error(
    texto.includes('<!DOCTYPE')
      ? `La ruta respondió HTML. Verifica que exista el endpoint. Status: ${response.status}`
      : texto || `Error HTTP ${response.status}`
  )
}

export default function EditarMultimediaModal({
  open,
  publicacionId,
  imagenesActuales,
  videoActual,
  videoUrlsActuales,
  onClose,
  onSaved
}: EditarMultimediaModalProps) {
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const [imagenes, setImagenes] = useState<string[]>([])
  const [videosUrl, setVideosUrl] = useState<string[]>(['', ''])
  const [imagenesNuevas, setImagenesNuevas] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mostrarConfirmacionCancelar, setMostrarConfirmacionCancelar] =
    useState(false)

  const videosIniciales = useMemo(() => {
    const videosDesdeProps =
      videoUrlsActuales && videoUrlsActuales.length > 0
        ? videoUrlsActuales
        : videoActual
          ? [videoActual]
          : []

    return [videosDesdeProps[0] ?? '', videosDesdeProps[1] ?? '']
  }, [videoActual, videoUrlsActuales])

  const totalImagenes = imagenes.length + imagenesNuevas.length
  const videosValidos = videosUrl.every((video) => esVideoPermitido(video))
  const videosConTexto = videosUrl.filter((video) => video.trim()).length

  useEffect(() => {
    if (open) {
      setImagenes(imagenesActuales ?? [])
      setVideosUrl([videosIniciales[0] ?? '', videosIniciales[1] ?? ''])
      setImagenesNuevas([])
      setError('')
      setSuccess('')
      setMostrarConfirmacionCancelar(false)
    }
  }, [open, imagenesActuales, videosIniciales])

  if (!open) return null

  const hayCambiosSinGuardar = () => {
    return (
      JSON.stringify(imagenes) !== JSON.stringify(imagenesActuales ?? []) ||
      imagenesNuevas.length > 0 ||
      videosUrl[0] !== (videosIniciales[0] ?? '') ||
      videosUrl[1] !== (videosIniciales[1] ?? '')
    )
  }

  const handleCancelar = () => {
    if (guardando) return

    if (hayCambiosSinGuardar()) {
      setMostrarConfirmacionCancelar(true)
      return
    }

    onClose()
  }

  const confirmarCancelarCambios = () => {
    setMostrarConfirmacionCancelar(false)
    onClose()
  }

  const handleAgregarImagen = () => {
    if (totalImagenes >= LIMITE_IMAGENES) {
      setError(`Has alcanzado el límite máximo de ${LIMITE_IMAGENES} imágenes.`)
      return
    }

    inputFileRef.current?.click()
  }

  const handleSeleccionarImagen = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')
    setSuccess('')

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/jpg']

    if (!formatosPermitidos.includes(file.type)) {
      setError('Formato no válido. Solo se permiten archivos JPG y PNG.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo supera el tamaño máximo permitido de 5MB por imagen.')
      event.target.value = ''
      return
    }

    if (totalImagenes >= LIMITE_IMAGENES) {
      setError(`Has alcanzado el límite máximo de ${LIMITE_IMAGENES} imágenes.`)
      event.target.value = ''
      return
    }

    try {
      const base64 = await convertirArchivoABase64(file)
      setImagenesNuevas((prev) => [...prev, base64])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la imagen'
      )
    } finally {
      event.target.value = ''
    }
  }

  const handleEliminarImagenActual = (index: number) => {
    setError('')
    setSuccess('')
    setImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEliminarImagenNueva = (index: number) => {
    setError('')
    setSuccess('')
    setImagenesNuevas((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCambiarVideo = (index: number, value: string) => {
    setVideosUrl((prev) =>
      prev.map((video, videoIndex) => (videoIndex === index ? value : video))
    )
    setError('')
    setSuccess('')
  }

  const handleVistaPrevia = (index: number) => {
    const videoUrl = videosUrl[index]

    setError('')
    setSuccess('')

    if (!videoUrl.trim()) {
      setError('Primero ingresa un enlace de video')
      return
    }

    if (!esVideoPermitido(videoUrl)) {
      setError('Solo se permiten enlaces de YouTube o Plataformas permitidas.')
      return
    }

    window.open(videoUrl.trim(), '_blank', 'noopener,noreferrer')
  }

  const handleEliminarVideo = (index: number) => {
    setError('')
    setSuccess('')
    setVideosUrl((prev) =>
      prev.map((video, videoIndex) => (videoIndex === index ? '' : video))
    )
  }

  const handleGuardar = async () => {
    try {
      setGuardando(true)
      setError('')
      setSuccess('')

      if (totalImagenes === 0) {
        setError('La publicación debe tener al menos 1 imagen.')
        return
      }

      if (!videosValidos) {
        setError('Solo se permiten enlaces de YouTube o Plataformas permitidas.')
        return
      }

      if (videosConTexto > LIMITE_VIDEOS) {
        setError(`Solo se permiten hasta ${LIMITE_VIDEOS} enlaces de video.`)
        return
      }

      const apiUrl = getApiUrl()
      const token = getToken()

      const videosLimpios = videosUrl
        .map((video) => video.trim())
        .filter(Boolean)

      const response = await fetch(
        `${apiUrl}/api/publicaciones/${publicacionId}/multimedia`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            imagenesActuales: imagenes,
            imagenesNuevas,
            videoUrl: videosLimpios[0] ?? null,
            videoUrls: videosLimpios
          })
        }
      )

      const data = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(
          data?.message ?? data?.error ?? 'No se pudo guardar la multimedia'
        )
      }

      setSuccess('Contenido multimedia actualizado correctamente.')

      setTimeout(async () => {
        await onSaved()
        onClose()
      }, 900)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar la multimedia'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-7 shadow-xl">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">
            Editar imágenes y video
          </h2>

          <button
            type="button"
            onClick={handleCancelar}
            disabled={guardando}
            className="text-3xl leading-none text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            {success}
          </div>
        )}

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Imágenes actuales ({totalImagenes}/{LIMITE_IMAGENES})
          </h3>

          {totalImagenes >= LIMITE_IMAGENES && (
            <p className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              Has alcanzado el límite máximo de {LIMITE_IMAGENES} imágenes.
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {imagenes.map((imagen, index) => (
              <div
                key={`actual-${imagen}-${index}`}
                className="relative h-36 w-44 overflow-hidden rounded-xl border border-orange-200 bg-gray-100"
              >
                <img
                  src={imagen}
                  alt={`Imagen actual ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleEliminarImagenActual(index)}
                  disabled={guardando}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ×
                </button>
              </div>
            ))}

            {imagenesNuevas.map((imagen, index) => (
              <div
                key={`nueva-${index}`}
                className="relative h-36 w-44 overflow-hidden rounded-xl border border-orange-200 bg-gray-100"
              >
                <img
                  src={imagen}
                  alt={`Imagen nueva ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleEliminarImagenNueva(index)}
                  disabled={guardando}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAgregarImagen}
              disabled={guardando || totalImagenes >= LIMITE_IMAGENES}
              className="flex h-36 w-44 flex-col items-center justify-center rounded-xl border border-dashed border-gray-400 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-3xl font-bold">+</span>
              <span className="mt-3 text-lg">Agregar imagen</span>
            </button>
          </div>

          <input
            ref={inputFileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleSeleccionarImagen}
            className="hidden"
          />

          <p className="mt-4 text-sm text-gray-500">
            Puedes subir hasta {LIMITE_IMAGENES} imágenes. Formatos: JPG, PNG.
            Tamaño máximo: 5MB por imagen.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Videos de la propiedad opcional
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            Puedes agregar hasta {LIMITE_VIDEOS} enlaces de YouTube o Vimeo.
          </p>

          <div className="space-y-5">
            {videosUrl.map((video, index) => {
              const videoTieneTexto = video.trim().length > 0
              const videoValido = esVideoPermitido(video)

              return (
                <div key={`video-${index}`} className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Video {index + 1}
                  </label>

                  <div className="flex flex-col gap-4 md:flex-row">
                    <input
                      type="url"
                      value={video}
                      onChange={(e) => handleCambiarVideo(index, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`h-14 flex-1 rounded-lg border px-4 text-lg outline-none focus:border-[#D97706] ${
                        videoTieneTexto && !videoValido
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleVistaPrevia(index)}
                      disabled={guardando || !videoTieneTexto || !videoValido}
                      className="h-14 rounded-lg border border-[#D97706] px-7 font-semibold text-[#D97706] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Vista previa
                    </button>
                  </div>

                  {videoTieneTexto && !videoValido && (
                    <p className="text-sm text-red-600">
                      Solo se permiten enlaces de YouTube o Plataformas
                      permitidas.
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          'El video se actualizará al guardar multimedia'
                        )
                      }
                      disabled={guardando || !videoTieneTexto || !videoValido}
                      className="h-12 rounded-lg border border-[#D97706] font-semibold text-[#D97706] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cambiar video
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEliminarVideo(index)}
                      disabled={guardando || !videoTieneTexto}
                      className="h-12 rounded-lg border border-red-400 font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Eliminar video
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={guardando}
              className="h-14 rounded-lg border border-gray-400 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="h-14 rounded-lg bg-[#D97706] font-semibold text-white hover:bg-[#bf6905] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {guardando ? 'Guardando...' : 'Guardar multimedia'}
            </button>
          </div>
        </div>
      </div>

      {mostrarConfirmacionCancelar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              ¿Cancelar cambios?
            </h3>

            <p className="mb-6 text-sm text-gray-600">
              Tienes cambios sin guardar. Si cancelas, se perderán las
              modificaciones realizadas en imágenes o videos.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionCancelar(false)}
                className="h-12 rounded-lg border border-gray-400 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Seguir editando
              </button>

              <button
                type="button"
                onClick={confirmarCancelarCambios}
                className="h-12 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}