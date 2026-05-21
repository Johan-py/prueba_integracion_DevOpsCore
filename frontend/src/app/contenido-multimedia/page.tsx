'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FotosSection from '@/components/contenido-multimedia/FotosSection'
import VideosSection from '@/components/contenido-multimedia/VideosSection'
import PublicarSection from '@/components/contenido-multimedia/PublicarSection'
import PlanModal from '@/components/contenido-multimedia/PlanModal'

type ImageItem = {
  id: string
  file?: File
  previewUrl: string
  name: string
  isExisting?: boolean
}

type VideoItem = {
  id: string
  type: 'file' | 'youtube'
  name: string
  previewUrl?: string
  embedUrl?: string
  file?: File
  sourceUrl?: string
}

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
  }

  return apiUrl
}

export default function ContenidoMultimediaPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Cargando...</div>}>
      <ContenidoMultimediaPageContent />
    </Suspense>
  )
}

function ContenidoMultimediaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const publicacionId = Number(searchParams.get('publicacionId'))

  const [images, setImages] = useState<ImageItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const [imageError, setImageError] = useState('')
  const [videoError, setVideoError] = useState('')
  const [publishError, setPublishError] = useState('')

  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isUploadingVideos, setIsUploadingVideos] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const [showPlanModal, setShowPlanModal] = useState(false)

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const cargarMultimediaExistente = async () => {
      if (!publicacionId || Number.isNaN(publicacionId)) return

      try {
        const response = await fetch(
          `${getApiUrl()}/api/publicaciones/${publicacionId}/detalle`
        )

        const result = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(result?.message || 'No se pudo cargar la multimedia existente.')
        }

        const imagenesBackend = result?.data?.imagenes || []
        const videoUrlsBackend = result?.data?.videoUrls || []

        const imagenesCargadas: ImageItem[] = imagenesBackend.map(
          (imagen: { id: number; url: string }, index: number) => ({
            id: String(imagen.id),
            previewUrl: imagen.url,
            name: `Imagen ${index + 1}`,
            isExisting: true
          })
        )

        const videosCargados: VideoItem[] = videoUrlsBackend.map(
          (url: string, index: number) => {
            const parsed = getYoutubeData(url)

            return {
              id: `video-existente-${index}`,
              type: 'youtube',
              name: `Video ${index + 1}`,
              sourceUrl: url,
              embedUrl: parsed?.embedUrl || url
            }
          }
        )

        setImages(imagenesCargadas.slice(0, 5))
        setVideos(videosCargados.slice(0, 2))
      } catch (error) {
        console.error('Error al cargar multimedia existente:', error)
      }
    }

    cargarMultimediaExistente()
  }, [publicacionId])

  const hasRequiredPhoto = images.length > 0

  const handleOpenImagePicker = () => {
    setImageError('')
    setPublishError('')
    imageInputRef.current?.click()
  }

  const handleOpenVideoPicker = () => {
    setVideoError('')
    setPublishError('')

    if (!hasRequiredPhoto) {
      setVideoError('Primero debes subir al menos una foto antes de agregar videos.')
      return
    }

    videoInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    setImageError('')
    setPublishError('')

    if (images.length + files.length > 5) {
      setImageError('Límite alcanzado. Solo puedes subir máximo 5 imágenes.')
      event.target.value = ''
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg']
    const maxSize = 5 * 1024 * 1024

    setIsUploadingImages(true)

    const validImages: ImageItem[] = []

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageError('Formato no permitido. Solo PNG o JPG.')
        continue
      }

      if (file.size > maxSize) {
        setImageError('Una de las imágenes supera los 5 MB.')
        continue
      }

      validImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        isExisting: false
      })
    }

    setImages((prev) => [...prev, ...validImages].slice(0, 5))
    setIsUploadingImages(false)
    event.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id)

      if (target?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return prev.filter((image) => image.id !== id)
    })

    setImageError('')
    setPublishError('')
  }

  const handleVideoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    setVideoError('')
    setPublishError('')

    if (!hasRequiredPhoto) {
      setVideoError('Primero debes subir al menos una foto antes de agregar videos.')
      event.target.value = ''
      return
    }

    if (videos.length + files.length > 2) {
      setVideoError('Límite alcanzado. Solo puedes subir máximo 2 videos.')
      event.target.value = ''
      return
    }

    const allowedTypes = ['video/mp4', 'video/x-matroska', 'video/avi', 'video/x-msvideo']
    const allowedExtensions = ['mp4', 'mkv', 'avi']
    const maxSize = 20 * 1024 * 1024

    setIsUploadingVideos(true)

    const validVideos: VideoItem[] = []

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const extensionAllowed = allowedExtensions.includes(extension || '')

      if (!allowedTypes.includes(file.type) && !extensionAllowed) {
        setVideoError('Formato no permitido. Solo MP4, MKV o AVI.')
        continue
      }

      if (file.size > maxSize) {
        setVideoError('Uno de los videos supera los 20 MB.')
        continue
      }

      validVideos.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        type: 'file',
        name: file.name,
        file,
        previewUrl: URL.createObjectURL(file)
      })
    }

    setVideos((prev) => [...prev, ...validVideos].slice(0, 2))
    setIsUploadingVideos(false)
    event.target.value = ''
  }

  const getYoutubeData = (url: string) => {
    const trimmed = url.trim()

    const shortMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/)

    if (shortMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${shortMatch[1]}`,
        sourceUrl: trimmed
      }
    }

    const normalMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
    )

    if (normalMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${normalMatch[1]}`,
        sourceUrl: trimmed
      }
    }

    const embedMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    )

    if (embedMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}`,
        sourceUrl: trimmed
      }
    }

    return null
  }

  const handleAddVideoLink = () => {
    setVideoError('')
    setPublishError('')

    if (!hasRequiredPhoto) {
      setVideoError('Primero debes subir al menos una foto antes de agregar videos.')
      return
    }

    if (!videoUrl.trim()) {
      setVideoError('Debes ingresar un enlace de video.')
      return
    }

    if (videos.length >= 2) {
      setVideoError('Límite alcanzado. Solo puedes agregar máximo 2 videos.')
      return
    }

    const parsed = getYoutubeData(videoUrl)

    if (!parsed) {
      setVideoError('Enlace de video no válido.')
      return
    }

    const newVideo: VideoItem = {
      id: `youtube-${Date.now()}-${Math.random()}`,
      type: 'youtube',
      name: 'Video de YouTube',
      embedUrl: parsed.embedUrl,
      sourceUrl: parsed.sourceUrl
    }

    setVideos((prev) => [...prev, newVideo].slice(0, 2))
    setVideoUrl('')
  }

  const handleRemoveVideo = (id: string) => {
    setVideos((prev) => {
      const target = prev.find((video) => video.id === id)

      if (target?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return prev.filter((video) => video.id !== id)
    })

    setVideoError('')
    setPublishError('')
  }

  const uploadImages = async (token: string) => {
    if (!images.length) {
      throw new Error('Debes subir al menos una foto del inmueble antes de publicar.')
    }

    const formData = new FormData()

    const imagenesActuales = images
      .filter((image) => image.isExisting)
      .map((image) => image.previewUrl)

    const videoUrls = videos
      .filter((video) => video.type === 'youtube' && video.sourceUrl)
      .map((video) => video.sourceUrl as string)

    formData.append('imagenesActuales', JSON.stringify(imagenesActuales))
    formData.append('videoUrls', JSON.stringify(videoUrls))

    images.forEach((image) => {
      if (image.file) {
        formData.append('imagenesNuevas', image.file)
      }
    })

    const response = await fetch(`${getApiUrl()}/api/publicaciones/${publicacionId}/multimedia`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || 'No se pudieron registrar las imágenes.')
    }
  }

  const uploadYoutubeLinks = async (_token: string) => {
    return
  }

  const handlePublish = async () => {
    setPublishError('')
    setImageError('')
    setVideoError('')

    if (!publicacionId || Number.isNaN(publicacionId)) {
      setPublishError('No se recibió el ID de la publicación.')
      return
    }

    if (!hasRequiredPhoto) {
      setPublishError('Debes subir al menos una foto del inmueble antes de publicar.')
      setImageError('La foto es obligatoria. Sube mínimo una imagen del inmueble.')
      return
    }

    if (!confirmed) {
      setPublishError('Debes confirmar que la información es correcta.')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      setPublishError('No se encontró la sesión del usuario.')
      return
    }

    const hasLocalVideoFiles = videos.some((video) => video.type === 'file')

    if (hasLocalVideoFiles) {
      setPublishError(
        'Por ahora el backend solo permite registrar enlaces de video. Los videos subidos como archivo aún no están soportados.'
      )
      return
    }

    try {
      setIsPublishing(true)

      await uploadImages(token)
      await uploadYoutubeLinks(token)

      router.push(`/resumen-final?id=${publicacionId}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al registrar el contenido multimedia.'

      setPublishError(message)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fdf7f5',
        padding: '24px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', marginBottom: '8px' }}>Contenido Multimedia</h1>

        <p style={{ fontSize: '20px', color: '#666', marginBottom: '24px' }}>
          Agrega mínimo 1 foto obligatoria y hasta 2 videos opcionales para mostrar mejor tu inmueble.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}
        >
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            Publicación actual: #{publicacionId || 'sin id'}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`/propiedades/parametros?publicacionId=${publicacionId || ''}&origen=multimedia`)
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f57c00',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Añadir otros parámetros
          </button>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept=".mp4,.mkv,.avi,video/mp4,video/x-matroska,video/avi,video/x-msvideo"
          multiple
          style={{ display: 'none' }}
          onChange={handleVideoFileChange}
        />

        <FotosSection
          images={images}
          onOpenPicker={handleOpenImagePicker}
          onRemoveImage={handleRemoveImage}
          error={imageError}
          isUploading={isUploadingImages}
        />

        <VideosSection
          videos={videos}
          videoUrl={videoUrl}
          onVideoUrlChange={setVideoUrl}
          onAddVideoLink={handleAddVideoLink}
          onOpenVideoPicker={handleOpenVideoPicker}
          onRemoveVideo={handleRemoveVideo}
          error={videoError}
          isUploading={isUploadingVideos}
        />

        <PublicarSection
          confirmed={confirmed}
          onConfirmedChange={setConfirmed}
          onPublish={handlePublish}
          publishError={isPublishing ? 'Publicando contenido multimedia...' : publishError}
          canPublish={hasRequiredPhoto && !isPublishing}
        />

        <PlanModal
          open={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onPayNow={() => alert('Aquí luego conectas el flujo de pago')}
        />
      </div>
    </main>
  )
}