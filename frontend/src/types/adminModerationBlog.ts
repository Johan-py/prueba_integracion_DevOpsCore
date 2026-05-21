export type AdminModerationStatus = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO'

export type AdminBlogSection = {
  heading?: string
  paragraphs: string[]
}

export type AdminModerationBlog = {
  id: string
  title: string
  category: string
  authorName: string
  authorRole: string
  submittedAt: string
  readingTime: string
  coverImage: string
  excerpt: string
  lead: string
  sections: AdminBlogSection[]
  status: AdminModerationStatus
  rejectionComment: string | null
  reviewedAt: string | null
}
