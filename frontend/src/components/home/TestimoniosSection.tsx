'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTestimonios, toggleLikeTestimonio, type Testimonio } from '@/services/testimonio.service'

const CIUDADES = ['Todos', 'La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Potosí', 'Oruro', 'Beni', 'Pando']

// Cuántas tarjetas mostrar según el ancho de pantalla
const getVisibleCount = () => {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth >= 768) return 2
  return 1
}

export default function TestimoniosSection() {
  const [ciudadActiva, setCiudadActiva] = useState('Todos')
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likingId, setLikingId] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [visibleCount, setVisibleCount] = useState(1)

  // Sincronizar estado de sesión con localStorage
  useEffect(() => {
    const checkSession = () => setIsLoggedIn(!!localStorage.getItem('token'))
    checkSession()
    window.addEventListener('propbol:login', checkSession)
    window.addEventListener('propbol:session-changed', checkSession)
    return () => {
      window.removeEventListener('propbol:login', checkSession)
      window.removeEventListener('propbol:session-changed', checkSession)
    }
  }, [])

  // Detectar breakpoint al montar y en resize
  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const cargarTestimonios = useCallback(async (ciudad: string) => {
    setLoading(true)
    setCurrentIndex(0)
    const data = await getTestimonios(ciudad === 'Todos' ? undefined : ciudad)
    setTestimonios(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarTestimonios(ciudadActiva)
  }, [ciudadActiva, cargarTestimonios])

  // Autoplay — avanza cada 5 segundos
  useEffect(() => {
    if (testimonios.length <= visibleCount) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = testimonios.length - visibleCount
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonios.length, visibleCount])

  const handleCiudad = (ciudad: string) => {
    setCiudadActiva(ciudad)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonios.length - visibleCount
      return prev === 0 ? maxIndex : prev - 1
    })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonios.length - visibleCount
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const handleLike = async (testimonio: Testimonio) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    if (likingId === testimonio.id) return
    setLikingId(testimonio.id)
    try {
      const result = await toggleLikeTestimonio(testimonio.id)
      setTestimonios((prev) =>
        prev.map((t) =>
          t.id === testimonio.id
            ? { ...t, meGusta: result.meGusta, totalLikes: result.totalLikes }
            : t
        )
      )
    } catch {
      // ignorar error silenciosamente
    } finally {
      setLikingId(null)
    }
  }

  // Tarjetas visibles en este momento
  const visibleTestimonios = testimonios.slice(currentIndex, currentIndex + visibleCount)
  const maxIndex = Math.max(0, testimonios.length - visibleCount)
  const totalDots = maxIndex + 1

  return (
    <section className="bg-white dark:bg-stone-900 py-10 md:py-14 lg:py-16 w-full overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Título */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-1 leading-snug">
            Historias reales de{' '}
            <span className="text-amber-600">Bolivia</span>
          </h2>
          <p className="text-[10px] sm:text-xs tracking-widest text-stone-400 dark:text-stone-500 uppercase font-medium">
            Lo que dicen nuestros usuarios
          </p>
        </div>

        {/* Filtros de ciudad */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 md:mb-8">
          {CIUDADES.map((ciudad) => (
            <button
              key={ciudad}
              onClick={() => handleCiudad(ciudad)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                ciudadActiva === ciudad
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {ciudad}
            </button>
          ))}
        </div>

        {/* Carrusel */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonios.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm sm:text-base">No hay testimonios disponibles para esta ciudad.</p>
          </div>
        ) : (
          <>
            <div className="relative flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* fix(a11y): aria-label en botón anterior */}
              <button
                onClick={handlePrev}
                disabled={testimonios.length <= visibleCount}
                aria-label="Testimonio anterior"
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-400 bg-white dark:bg-stone-800 hover:text-amber-600 hover:border-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTestimonios.map((t) => (
                  <TarjetaTestimonio
                    key={t.id}
                    testimonio={t}
                    isLoggedIn={isLoggedIn}
                    likingId={likingId}
                    onLike={handleLike}
                  />
                ))}
              </div>

              {/* fix(a11y): aria-label en botón siguiente */}
              <button
                onClick={handleNext}
                disabled={testimonios.length <= visibleCount}
                aria-label="Testimonio siguiente"
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-400 bg-white dark:bg-stone-800 hover:text-amber-600 hover:border-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Dots */}
            {totalDots > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalDots }).map((_, i) => (
                  // fix(a11y): aria-label y aria-current en dots
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Ir al testimonio ${i + 1}`}
                    aria-current={i === currentIndex ? 'true' : undefined}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentIndex
                        ? 'w-6 h-2.5 bg-amber-600'
                        : 'w-2.5 h-2.5 bg-stone-300 dark:bg-white/40 hover:bg-stone-400 dark:hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ─── Subcomponente tarjeta ───────────────────────────────────────────────────

function TarjetaTestimonio({
  testimonio,
  isLoggedIn,
  likingId,
  onLike,
}: {
  testimonio: Testimonio
  isLoggedIn: boolean
  likingId: number | null
  onLike: (t: Testimonio) => void
}) {
  return (
    <div className="rounded-2xl border border-stone-100 dark:border-stone-700 shadow-md p-5 md:p-6 bg-white dark:bg-stone-800 flex flex-col justify-between min-h-[200px] min-w-0 overflow-hidden">
      <p className="text-stone-600 dark:text-stone-300 italic text-center text-sm leading-relaxed mb-4 break-words">
        "{testimonio.comentario}"
      </p>

      {/* fix(a11y): mayor contraste en línea divisoria */}
      <hr className="border-t border-stone-300 dark:border-stone-500 mb-4" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs md:text-sm font-bold">
              {testimonio.usuario.iniciales}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-tight truncate">
              {testimonio.usuario.nombre} {testimonio.usuario.apellido}
            </p>
            {(testimonio.ciudad || testimonio.zona) && (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                {[testimonio.ciudad, testimonio.zona].filter(Boolean).join(' – ')}
              </p>
            )}
            {/* fix(bug): se agrega {testimonio.categoria} que faltaba dentro del span */}
            {testimonio.categoria && (
              <span className="inline-block mt-1 text-[9px] md:text-[10px] font-semibold tracking-wide text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full shadow-sm px-2.5 py-0.5 uppercase max-w-full truncate">
                {testimonio.categoria}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onLike(testimonio)}
          disabled={!isLoggedIn || likingId === testimonio.id}
          title={!isLoggedIn ? 'Inicia sesión para dar like' : ''}
          className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all shrink-0 ${
            testimonio.meGusta
              ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 text-amber-600 dark:text-amber-400'
              : 'border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:border-amber-400 hover:text-amber-600'
          } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 md:w-4 md:h-4 ${testimonio.meGusta ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{testimonio.totalLikes}</span>
        </button>
      </div>
    </div>
  )
}