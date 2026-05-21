'use client'

import { useState } from 'react'
import { Copy, Mail, MessageCircle, Send, Share2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

interface Props {
  publicacionId: number
  titulo: string
}

type MedioCompartido = 'WHATSAPP' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL' | 'COPIAR_LINK'

export default function CompartirPublicacion({ publicacionId, titulo }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const obtenerUrlPublicacion = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const registrarCompartido = async (medio: MedioCompartido) => {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Debes iniciar sesión para compartir esta publicación')
      router.push('/sign-in')
      return false
    }

    const response = await fetch(`${API_URL}/api/inmuebles/${publicacionId}/compartidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        medio
      })
    })

    if (response.status === 401) {
      alert('Tu sesión expiró o debes iniciar sesión para compartir esta publicación')
      router.push('/sign-in')
      return false
    }

    if (!response.ok) {
      alert('No se pudo registrar el compartido. Inténtalo nuevamente.')
      return false
    }

    return true
  }

  const compartir = async (medio: MedioCompartido) => {
    try {
      setLoading(true)

      const registrado = await registrarCompartido(medio)

      if (!registrado) return

      const urlPublicacion = obtenerUrlPublicacion()
      const texto = `${titulo} - ${urlPublicacion}`

      if (medio === 'WHATSAPP') {
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
      }

      if (medio === 'FACEBOOK') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlPublicacion)}`,
          '_blank'
        )
      }

      if (medio === 'TELEGRAM') {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(urlPublicacion)}&text=${encodeURIComponent(
            titulo
          )}`,
          '_blank'
        )
      }

      if (medio === 'EMAIL') {
        window.location.href = `mailto:?subject=${encodeURIComponent(
          titulo
        )}&body=${encodeURIComponent(urlPublicacion)}`
      }

      if (medio === 'COPIAR_LINK') {
        await navigator.clipboard.writeText(urlPublicacion)
        alert('Enlace copiado correctamente')
      }

      setOpen(false)
    } catch {
      alert('Ocurrió un error al compartir la publicación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ede7dc] text-black transition hover:bg-[#e0d7ca]"
        aria-label="Compartir publicación"
      >
        <Share2 className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1f1f1f]">Compartir publicación</h3>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[#555] transition hover:bg-[#f0f0f0]"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => compartir('WHATSAPP')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ddd] px-4 py-3 text-left text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f7f7] disabled:opacity-60"
              >
                <MessageCircle className="h-5 w-5 text-[#d97f05]" />
                WhatsApp
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => compartir('FACEBOOK')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ddd] px-4 py-3 text-left text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f7f7] disabled:opacity-60"
              >
                <Share2 className="h-5 w-5 text-[#d97f05]" />
                Facebook
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => compartir('TELEGRAM')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ddd] px-4 py-3 text-left text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f7f7] disabled:opacity-60"
              >
                <Send className="h-5 w-5 text-[#d97f05]" />
                Telegram
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => compartir('EMAIL')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ddd] px-4 py-3 text-left text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f7f7] disabled:opacity-60"
              >
                <Mail className="h-5 w-5 text-[#d97f05]" />
                Email
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => compartir('COPIAR_LINK')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ddd] px-4 py-3 text-left text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f7f7] disabled:opacity-60"
              >
                <Copy className="h-5 w-5 text-[#d97f05]" />
                Copiar enlace
              </button>
            </div>

            {loading && (
              <p className="mt-4 text-center text-sm text-[#6b6259]">
                Registrando compartido...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}