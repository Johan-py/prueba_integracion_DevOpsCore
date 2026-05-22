/**
 * Convierte enlaces de YouTube guardados como "imagen" en miniatura estática (i.ytimg.com).
 * Las URLs tipo watch/embed no son válidas como src de imagen.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const u = url.trim()
  if (!u) return null

  const shorts = u.match(/youtube\.com\/shorts\/([\w-]{11})(?:\?|#|$)/i)
  if (shorts?.[1]) return shorts[1]

  const embed = u.match(/youtube\.com\/embed\/([\w-]{11})(?:\?|#|$)/i)
  if (embed?.[1]) return embed[1]

  const youtuBe = u.match(/youtu\.be\/([\w-]{11})(?:\?|#|$)/i)
  if (youtuBe?.[1]) return youtuBe[1]

  if (/youtube\.com/i.test(u)) {
    const fromQuery = u.match(/[?&]v=([\w-]{11})(?:&|#|$)/i)
    if (fromQuery?.[1]) return fromQuery[1]
    try {
      const parsed = new URL(u)
      if (parsed.hostname.endsWith('youtube.com') && parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v')
        if (v && /^[\w-]{11}$/.test(v)) return v
      }
    } catch {
      /* ignore */
    }
  }

  return null
}

export function normalizePropertyThumbnailUrl(
  url: string | undefined | null,
  fallback?: string
): string {
  const raw = url?.trim()
  if (!raw) return fallback ?? ''
  const id = extractYouTubeVideoId(raw)
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  return raw
}
