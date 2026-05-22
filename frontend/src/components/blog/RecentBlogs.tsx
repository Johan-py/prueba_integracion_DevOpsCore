'use client'

import React, { useEffect, useState } from 'react'
import UserBlogCard from './UserBlogCard'
import { Blog } from '@/types/blog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const RecentBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMisBlogs = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { setError('No hay sesión activa'); return }

        const res = await fetch(`${API_URL}/api/blogs/mis-blogs`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Error al obtener blogs')

        const data = await res.json()
        const mapped: Blog[] = data.map((b: any) => ({
          id: b.id,
          titulo: b.titulo,
          imagenUrl: b.imagen || '/placeholder-house.jpg',
          estado: b.estado,
          fecha: b.fecha_creacion
            ? new Date(b.fecha_creacion).toLocaleDateString('es-BO')
            : ''
        }))

        const recientes = mapped
        .sort(
          (a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
        .slice(0, 3)

        setBlogs(recientes)
      } catch {
        setError('No se pudieron cargar los blogs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMisBlogs()
  }, [])

  if (isLoading) return <p className="text-sm text-gray-400">Cargando blogs...</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (blogs.length === 0) return <p className="text-sm text-gray-400">No tienes blogs aún.</p>

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">Mis blogs</h2>
      <div className="grid grid-cols-1 gap-3">
        {blogs.map((blog) => (
          <UserBlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  )
}

export default RecentBlogs