import { MOCK_PUBLIC_BLOGS } from '@/lib/mock/publicBlogs.mock'
import { createPlainTextExcerpt } from '@/lib/blogMarkdown'
import { PublicBlogCard, BlogCategory } from '@/types/publicBlog'

export type BlogCreationAction = 'borrador' | 'pendiente'

export type BlogCategoryOption = {
  id: number
  nombre: string
}

type UploadedBlogImageResponse = {
  path: string
  url: string
}

export type CreateBlogPayload = {
  titulo: string
  contenido: string
  imagen: string
  categoria_id: number
  accion: BlogCreationAction
}

export type BlogRechazo = {
  comentario: string
  fecha: string
}

export type EditableBlog = {
  id: number
  titulo: string
  contenido: string
  imagen: string
  categoria_id: number
  estado: 'BORRADOR' | 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO'
  blog_rechazo?: BlogRechazo[]
}

type CreatedBlogResponse = {
  id: number
  titulo: string
  estado: 'BORRADOR' | 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO'
}

type UserBlogRow = {
  id: number
  titulo: string
  contenido: string
  imagen: string | null
  categoria_id: number
  estado: 'BORRADOR' | 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO'
  blog_rechazo?: BlogRechazo[]
}

const getApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const getToken = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No hay sesión activa. Inicia sesión nuevamente.')
  }

  return token
}

interface BlogApiRow {
  id: number
  titulo: string
  resumen?: string
  contenido: string
  imagen?: string
  fecha_publicacion?: string
  fecha_creacion: string
  usuario?: {
    nombre?: string
    apellido?: string
  }
  categoria_blog?: {
    nombre: string
  }
}

export type PublicBlogDetail = PublicBlogCard & {
  content: string
}

const formatImageUrl = (imagen: string | null | undefined, apiUrl: string) => {
  if (!imagen) return '/placeholder-blog.jpg'
  if (imagen.startsWith('http://') || imagen.startsWith('https://')) return imagen
  if (imagen.startsWith('/')) return imagen
  return `${apiUrl}/${imagen}`
}

export const getPublishedBlogs = async (limit: number = 10): Promise<PublicBlogCard[]> => {
  const apiUrl = getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/api/blogs?limit=${limit}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const result = await response.json()
    const rows = (result.data || []) as BlogApiRow[]

    return rows.map((row: BlogApiRow) => ({
      id: String(row.id),
      title: row.titulo,
      excerpt: row.resumen || createPlainTextExcerpt(row.contenido),
      imageUrl: formatImageUrl(row.imagen, apiUrl),
      category: (row.categoria_blog?.nombre || 'General') as BlogCategory,
      authorName: `${row.usuario?.nombre || ''} ${row.usuario?.apellido || ''}`.trim() || 'Anónimo',
      publishedAt: row.fecha_publicacion || row.fecha_creacion
    }))
  } catch (error) {
    console.error('Error al obtener los blogs publicados:', error)
    if (error instanceof TypeError) {
      return MOCK_PUBLIC_BLOGS.slice(0, limit)
    }
    return []
  }
}

export const getPublishedBlogById = async (id: string): Promise<PublicBlogDetail | null> => {
  const apiUrl = getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/api/blogs/${id}`, {
      cache: 'no-store'
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const row = (await response.json()) as BlogApiRow

    return {
      id: String(row.id),
      title: row.titulo,
      excerpt: row.resumen || createPlainTextExcerpt(row.contenido),
      imageUrl: formatImageUrl(row.imagen, apiUrl),
      category: (row.categoria_blog?.nombre || 'General') as BlogCategory,
      authorName: `${row.usuario?.nombre || ''} ${row.usuario?.apellido || ''}`.trim() || 'Anónimo',
      publishedAt: row.fecha_publicacion || row.fecha_creacion,
      content: row.contenido
    }
  } catch (error) {
    console.error('Error al obtener el detalle del blog:', error)

    const fallbackBlog = MOCK_PUBLIC_BLOGS.find((blog) => blog.id === id)

    if (!fallbackBlog) {
      return null
    }

    return {
      ...fallbackBlog,
      content: fallbackBlog.excerpt
    }
  }
}

export async function getBlogCategories(): Promise<BlogCategoryOption[]> {
  const response = await fetch(`${getApiUrl()}/api/blogs/categorias`, {
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron cargar las categorías')
  }

  return data
}

export async function createBlog(payload: CreateBlogPayload): Promise<CreatedBlogResponse> {
  const response = await fetch(`${getApiUrl()}/api/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el blog')
  }

  return data
}

export async function updateBlog(
  id: number,
  payload: CreateBlogPayload
): Promise<CreatedBlogResponse> {
  const response = await fetch(`${getApiUrl()}/api/blogs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar el blog')
  }

  return data
}

export async function getEditableBlog(id: number): Promise<EditableBlog> {
  const response = await fetch(`${getApiUrl()}/api/blogs/mis-blogs`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron cargar tus blogs')
  }

  const blog = (data as UserBlogRow[]).find((row) => row.id === id)

  if (!blog) {
    throw new Error('No se encontró el blog solicitado.')
  }

  return {
    id: blog.id,
    titulo: blog.titulo,
    contenido: blog.contenido,
    imagen: blog.imagen ?? '',
    categoria_id: blog.categoria_id,
    estado: blog.estado,
    blog_rechazo: blog.blog_rechazo
  }
}

export async function resubmitBlog(id: number): Promise<CreatedBlogResponse> {
  const response = await fetch(`${getApiUrl()}/api/blogs/${id}/resubmit`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo reenviar el blog')
  }

  return data
}

export async function uploadBlogImage(file: File): Promise<UploadedBlogImageResponse> {
  const formData = new FormData()
  formData.append('imagen', file)

  const response = await fetch(`${getApiUrl()}/api/blogs/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo subir la imagen del blog')
  }

  return data
}
