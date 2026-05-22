"use client"

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  images: string[]
  cityName: string
}

const FALLBACK_IMAGE = "/placeholder-house.jpg"
const EDGE_ACTIVATION_WIDTH = 72
const SWIPE_THRESHOLD = 42

export default function CityCarousel({ images, cityName }: Props) {
  const carouselImages = images.length > 0 ? images : [FALLBACK_IMAGE]
  const [index, setIndex] = useState(0)
  const [activeEdge, setActiveEdge] = useState<"left" | "right" | null>(null)
  const [imageError, setImageError] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  useEffect(() => {
    setIndex(0)
    setImageError(false)
    setActiveEdge(null)
  }, [images])

  useEffect(() => {
    setImageError(false)
  }, [index])

  useEffect(() => {
    if (carouselImages.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % carouselImages.length)
    }, 4000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [carouselImages.length])

  const activeImage = carouselImages[index] ?? FALLBACK_IMAGE
  const hasMultipleImages = carouselImages.length > 1

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - bounds.left

    if (offsetX <= EDGE_ACTIVATION_WIDTH) {
      setActiveEdge("left")
      return
    }

    if (bounds.width - offsetX <= EDGE_ACTIVATION_WIDTH) {
      setActiveEdge("right")
      return
    }

    setActiveEdge(null)
  }

  const handleMouseLeave = () => {
    setActiveEdge(null)
  }

  const showPreviousImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIndex((currentIndex) => (currentIndex - 1 + carouselImages.length) % carouselImages.length)
  }

  const showNextImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIndex((currentIndex) => (currentIndex + 1) % carouselImages.length)
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) {
      return
    }

    event.stopPropagation()
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) {
      return
    }

    event.stopPropagation()
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) {
      return
    }

    event.stopPropagation()

    const touchStartX = touchStartXRef.current
    const touchEndX = event.changedTouches[0]?.clientX

    touchStartXRef.current = null

    if (touchStartX === null || touchEndX === undefined) {
      return
    }

    const swipeDistance = touchEndX - touchStartX

    if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) {
      return
    }

    if (swipeDistance < 0) {
      setIndex((currentIndex) => (currentIndex + 1) % carouselImages.length)
      return
    }

    setIndex((currentIndex) => (currentIndex - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div
      className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-t-2xl bg-stone-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={imageError ? FALLBACK_IMAGE : activeImage}
        alt={`Vista destacada de ${cityName}`}
        fill
        unoptimized
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 md:group-hover:scale-[1.02]"
        onError={() => setImageError(true)}
      />

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            onClick={showPreviousImage}
            className={`absolute inset-y-0 left-0 z-10 flex w-16 items-center justify-start bg-gradient-to-r from-black/30 via-black/10 to-transparent pl-2 text-white transition-opacity duration-200 opacity-100 md:opacity-0 md:group-focus-within:opacity-100 ${
              activeEdge === "left" ? "md:opacity-100" : ""
            }`}
            aria-label="Mostrar imagen anterior"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm transition hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={showNextImage}
            className={`absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-end bg-gradient-to-l from-black/30 via-black/10 to-transparent pr-2 text-white transition-opacity duration-200 opacity-100 md:opacity-0 md:group-focus-within:opacity-100 ${
              activeEdge === "right" ? "md:opacity-100" : ""
            }`}
            aria-label="Mostrar imagen siguiente"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm transition hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </>
      ) : null}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/15 px-3 py-1 backdrop-blur-sm">
        {carouselImages.map((image, dotIndex) => (
          <button
            key={`${image}-${dotIndex}`}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setIndex(dotIndex)
            }}
            className={`h-2.5 rounded-full transition-all ${
              dotIndex === index ? "w-6 bg-white" : "w-2.5 bg-white/65"
            }`}
            aria-label={`Mostrar imagen ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
