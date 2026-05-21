import { useEffect, useState } from "react"

export function useCitiesCarousel(totalPages: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(totalPages - 1, 0)))
  }, [totalPages])

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, Math.max(totalPages - 1, 0)))
  }

  const prev = () => {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  const goTo = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(nextIndex, Math.max(totalPages - 1, 0))))
  }

  return { index, next, prev, goTo }
}
