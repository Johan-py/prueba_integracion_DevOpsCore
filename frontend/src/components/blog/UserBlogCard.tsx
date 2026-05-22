import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Blog } from '@/types/blog'
import { Trash2, Edit3 } from 'lucide-react'

interface UserBlogCardProps {
  blog: Blog
}

const UserBlogCard: React.FC<UserBlogCardProps> = ({ blog }) => {
  const isEditable = blog.estado === 'Borrador' || blog.estado === 'Rechazado'

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      {/* 1. Imagen Miniatura (HU7) */}
      <div className="relative w-24 h-20 overflow-hidden rounded-lg flex-shrink-0 bg-gray-100">
        <Image
          src={blog.imagenUrl || '/placeholder-house.jpg'}
          alt={blog.titulo}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* 2. Contenido de la Card */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          {/* Título y Fecha (HU7) */}
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{blog.titulo}</h3>
            <span className="text-[10px] text-gray-400 font-medium mt-1">{blog.fecha}</span>
          </div>

          {/* Icono de eliminar (HU11) */}
          <button className="text-red-400 hover:text-red-600 transition-colors ml-2">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* 3. Etiqueta de Estado (HU7 / HU11) */}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 bg-gray-50 text-gray-500 uppercase">
            {blog.estado}
          </span>

          {/* Botón Editar (HU11) */}
          {isEditable ? (
            <Link
              href={`/blog/${blog.id}/edit`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
            >
              <Edit3 size={14} />
              <span className="text-xs font-semibold uppercase">Editar</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-300">
              <Edit3 size={14} />
              <span className="text-xs font-semibold uppercase">Editar</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserBlogCard
