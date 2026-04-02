export const MAX_IMAGES_PER_PUBLICATION = 5
export const MAX_IMAGE_SIZE_MB = 5
export const MAX_VIDEOS_PER_PUBLICATION = 2
export const MAX_VIDEO_SIZE_MB = 20

export const ALLOWED_IMAGE_EXTENSIONS: string[] = ['png', 'jpg', 'jpeg']
export const ALLOWED_VIDEO_EXTENSIONS: string[] = ['mp4', 'mkv', 'avi']
export const ALLOWED_YOUTUBE_HOSTS: string[] = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be'
]

export const MULTIMEDIA_TYPES = {
  IMAGE: 'IMAGEN',
  VIDEO: 'VIDEO'
} as const