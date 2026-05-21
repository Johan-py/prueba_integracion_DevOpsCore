'use client'

import { useState, useEffect, useRef } from 'react'
import { HomeBanner } from './HomeBanner'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerData {
  id: number
  urlImagen: string
  titulo?: string
  subtitulo?: string
}

export const HomeCarousel = ({ banners }: { banners: BannerData[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false) // Para el criterio de pausa
  const touchStartX = useRef<number | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide()
    }, 4000) // Criterio: Intervalo de 4 segundos exactamente

    return () => clearInterval(timer)
  }, [currentIndex, banners.length, isPaused])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (diff > 50) nextSlide()
    else if (diff < -50) prevSlide()
    touchStartX.current = null
  }

  if (!banners || banners.length === 0) return null

  return (
    <div 
      className="relative w-full overflow-hidden" 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)} 
    >
      <HomeBanner
        url={banners[currentIndex].urlImagen}
        title={banners[currentIndex].titulo || 'Encuentra tu lugar ideal'}
        subtitle={banners[currentIndex].subtitulo}
      />
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-all hover:scale-110"
      >
        <ChevronLeft className="w-10 h-10 drop-shadow-lg" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-all hover:scale-110"
      >
        <ChevronRight className="w-10 h-10 drop-shadow-lg" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-white w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
// fin del componente