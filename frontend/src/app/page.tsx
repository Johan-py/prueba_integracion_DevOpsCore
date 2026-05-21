import { HomeCarousel } from '@/components/home/HomeCarousel'
import FeaturedCitiesSection from '@/components/home/FeaturedCitiesSection'
import ExploreSection from '@/components/layout/ExploreSection'
import { getCities } from '@/services/city.service'
import dynamic from 'next/dynamic'
import VisualFiltersSection from '@/components/VisualFilters/VisualFiltersSection'
import HomeBlogsSection from '@/components/home/HomeBlogsSection'
import TestimoniosSection from '@/components/home/TestimoniosSection'
import HomeExchangeSection from '@/components/home/HomeExchangeSection'
import WelcomeToast from '@/components/home/WelcomeToast'

const TourGuiado = dynamic(() => import('@/components/ui/TourGuiado'), { ssr: false })

interface BannerRaw {
  id: number
  url_imagen: string
  titulo?: string
  subtitulo?: string
}

interface BannerData {
  id: number
  urlImagen: string
  titulo?: string
  subtitulo?: string
}

const fetchBanners = async (): Promise<BannerData[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  try {
    const response = await fetch(`${apiUrl}/api/banners`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.warn(`Aviso: HTTP ${response.status} al obtener banners.`)
      return []
    }

    const data: BannerRaw[] = await response.json()

    return data.map((b) => ({
      id: b.id,
      urlImagen: b.url_imagen,
      titulo: b.titulo,
      subtitulo: b.subtitulo
    }))
  } catch (error) {
    console.warn('Aviso: El backend no está disponible para pre-renderizar los banners.', error)
    return []
  }
}

export default async function Home() {
  const banners = await fetchBanners()
  const cities = await getCities().catch((error) => {
    console.warn('Aviso (Build): Falló getCities, devolviendo array vacío.', error)
    return []
  })
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      <WelcomeToast />
      <TourGuiado />

      {banners.length > 0 ? (
        <HomeCarousel banners={banners} />
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center bg-gray-200">
          <p className="text-gray-600">No hay banners disponibles</p>
        </div>
      )}

      <HomeExchangeSection />

      <div className="w-full max-w-[1600px] mx-auto px-0 md:px-4 py-4">
        <div className="flex flex-col gap-0">
          {/* EXPLORE SECTION */}
          <section className="w-full">
            <ExploreSection />
          </section>

          {/* FILTROS VISUALES */}
          <section className="w-full">
            <VisualFiltersSection />
          </section>

          <section className="w-full">
            <FeaturedCitiesSection cities={cities} />
          </section>

          <section className="w-full">
            <HomeBlogsSection />
          </section>

          {/* TESTIMONIOS */}
          <section className="w-full">
            <TestimoniosSection />
          </section>
        </div>
      </div>
    </main>
  )
}
