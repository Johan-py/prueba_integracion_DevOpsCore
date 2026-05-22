export const BLOG_COMMENT_MAX_LENGTH = 500
export const INITIAL_VISIBLE_TOP_LEVEL_COMMENTS = 3

export interface BlogCommentAuthor {
  id: string
  name: string
  avatar: string | null
  email?: string
}

export interface BlogComment {
  id: string
  blogId: string
  parentId: string | null
  author: BlogCommentAuthor
  content: string
  createdAt: string
  updatedAt: string | null
  likes: number
  likedByCurrentUser: boolean
}
