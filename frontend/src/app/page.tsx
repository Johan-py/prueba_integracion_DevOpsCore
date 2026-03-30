import { HomeBanner } from '@/components/home/HomeBanner'
import ExploreSection from '@/components/layout/ExploreSection'
import FilterPanel from '@/components/rentals/FilterPanel'
import RegisterSuccessToast from '@/components/layout/RegisterSuccessToast'
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
      // Revalidación ISR
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error cargando el banner:', error)
    return []
  }
}

export default async function Home() {
  const banners = await fetchBanners()
  const mainBanner = banners[0] // Tomamos el primero de la base de datos

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {/* Banner de tus compañeros */}
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
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Tu sección de Filtros (Columna Izquierda) */}
          <aside className="w-full lg:w-80 shrink-0 sticky top-24">
            <FilterPanel />
          </aside>

          {/* Sección de Explorar (Columna Derecha) */}
          <section className="flex-1 w-full">
            <ExploreSection />
          </section>
        </div>
      </div>
    </main>
  )
}
