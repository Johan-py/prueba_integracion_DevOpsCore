'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPlainTextExcerpt } from '@/lib/blogMarkdown'
import type { AdminModerationBlog, AdminModerationStatus } from '@/types/adminModerationBlog'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface BackendBlog {
  id: number
  titulo: string
  contenido: string
  imagen: string | null
  estado: string
  fecha_creacion: string
  usuario: {
    nombre: string
    apellido: string
    avatar: string | null
  }
  categoria_blog: {
    nombre: string
  }
  blog_rechazo?: Array<{
    comentario: string
    fecha: string
  }>
}

function mapBackendToFrontend(blog: BackendBlog): AdminModerationBlog {
  return {
    id: String(blog.id),
    title: blog.titulo,
    category: blog.categoria_blog?.nombre || 'General',
    authorName: `${blog.usuario?.nombre} ${blog.usuario?.apellido}`,
    authorRole: 'Autor de PropBol',
    submittedAt: blog.fecha_creacion,
    readingTime: '5 min',
    coverImage: blog.imagen || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    excerpt: createPlainTextExcerpt(blog.contenido, 150),
    lead: createPlainTextExcerpt(blog.contenido, 300),
    sections: [
      {
        paragraphs: [blog.contenido]
      }
    ],
    status: blog.estado as AdminModerationStatus,
    rejectionComment: blog.blog_rechazo?.[0]?.comentario || null,
    reviewedAt: blog.blog_rechazo?.[0]?.fecha || null
  }
}

export function useAdminBlogModeration() {
  const [blogs, setBlogs] = useState<AdminModerationBlog[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Obtenemos todos los blogs para que el frontend filtre como antes (o podríamos filtrar por estado en la query)
      const response = await fetch(`${API_URL}/api/blogs/admin?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const mapped = data.data.map(mapBackendToFrontend)
        setBlogs(mapped)
      } else {
        setError('Error al cargar los blogs')
      }
    } catch (err) {
      console.error('Error fetching admin blogs:', err)
      setError('Error de conexión con el servidor')
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const updateBlogStatus = async (
    blogId: string,
    nextStatus: AdminModerationStatus,
    rejectionComment?: string
  ) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/blogs/${blogId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: nextStatus === 'PUBLICADO' ? 'PUBLICADO' : 'RECHAZADO',
          razon_rechazo: rejectionComment
        })
      })

      if (response.ok) {
        // Refrescar la lista después de actualizar
        await fetchBlogs()
      } else {
        const data = await response.json()
        alert(data.message || 'Error al actualizar el estado')
      }
    } catch (err) {
      console.error('Error updating blog status:', err)
      alert('Error de conexión al intentar actualizar')
    }
  }

  return {
    blogs,
    isReady,
    error,
    updateBlogStatus,
    refresh: fetchBlogs
  }
}
