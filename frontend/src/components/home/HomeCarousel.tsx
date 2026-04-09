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
  const touchStartX = useRef<number | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  // auto-slide cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  // swipe mobile
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

  return (
    <div className="relative w-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <HomeBanner
        url={banners[currentIndex].urlImagen}
        title={banners[currentIndex].titulo || 'Encuentra tu lugar ideal'}
        subtitle={banners[currentIndex].subtitulo}
      />

      {/* Flechas */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50
        text-white/80 hover:text-white
        transition-all duration-200
        hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-10 h-10 drop-shadow-lg" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50
        text-white/80 hover:text-white
        transition-all duration-200
        hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-10 h-10 drop-shadow-lg" />
      </button>

      {/*  INDICADORES */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white w-4' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
