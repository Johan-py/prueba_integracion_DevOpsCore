import { HomeBanner } from '@/components/home/HomeBanner'
import ExploreSection from '@/components/layout/ExploreSection'
import FilterPanel from '@/components/rentals/FilterPanel'
interface BannerData {
  id: number
  urlImagen: string
  titulo?: string
  subtitulo?: string
}

const fetchBanners = async (): Promise<BannerData[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  try {
    console.log(`[frontend] Fetching banners from: ${apiUrl}/api/banners`);
    const response = await fetch(`${apiUrl}/api/banners`, {
      next: { revalidate: 3600 }
    })
    console.log(`[frontend] Banner fetch response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[frontend] Error cargando el banner:', error)
    return []
  }
}

export default async function Home() {
  const banners = await fetchBanners()
  console.log('[frontend] Banners fetched:', banners);
  const mainBanner = banners[0]
  console.log('[frontend] Main banner:', mainBanner);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {/* Banner */}
      {mainBanner && (
        <HomeBanner
          url={mainBanner.urlImagen}
          title={mainBanner.titulo || 'Encuentra tu lugar ideal en Bolivia'}
          subtitle={
            mainBanner.subtitulo || 'Compra, vende o alquila propiedades de forma rápida y segura'
          }
        />
      )}

      {/* Contenido Unificado: Tu FilterPanel + ExploreSection */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
          {/* Sección de Filtros (Columna Izquierda) */}
          <FilterPanel />

          {/* Sección de Explorar (Columna Derecha) */}
          <section className="flex-1 w-full">
            <ExploreSection />
          </section>
        </div>
      </div>
    </main>
  )
}
