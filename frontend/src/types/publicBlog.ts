export type BlogCategory = string

export type BlogStatus = 'BORRADOR' | 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO'

export interface CategoriaBlogRow {
  id: number
  nombre: BlogCategory
}

export interface BlogAuthorRow {
  id: number
  nombre: string
  apellido: string
}

export interface BlogRow {
  id: number
  titulo: string
  contenido: string
  resumen: string
  imagen: string
  estado: BlogStatus
  eliminado: boolean
  fecha_creacion: string
  fecha_publicacion: string | null
  usuario_id: number
  categoria_id: number
  categoria: CategoriaBlogRow
  usuario: BlogAuthorRow
  destacado?: boolean
}

export interface PublicBlogCard {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  category: BlogCategory
  categoryLabel?: string
  authorName: string
  publishedAt: string
  featuredLabel?: string
  articleCtaLabel?: string
  isFeatured?: boolean
}

export const mapBlogRowToPublicBlogCard = (blog: BlogRow): PublicBlogCard | null => {
  if (blog.estado !== 'PUBLICADO' || blog.eliminado || !blog.fecha_publicacion) {
    return null
  }

  return {
    id: String(blog.id),
    title: blog.titulo,
    excerpt: blog.resumen,
    imageUrl: blog.imagen,
    category: blog.categoria.nombre,
    categoryLabel: blog.categoria.nombre,
    authorName: `${blog.usuario.nombre} ${blog.usuario.apellido}`,
    publishedAt: blog.fecha_publicacion,
    isFeatured: blog.destacado ?? false
  }
}
