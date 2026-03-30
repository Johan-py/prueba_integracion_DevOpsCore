import FilterPanel from '@/components/rentals/FilterPanel';

import { HomeBanner } from '@/components/home/HomeBanner'
import ExploreSection from '@/components/layout/ExploreSection'

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
  const mainBanner = banners[0] // Tomamos el primero por ahora de la base de datos

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Bienvenido a PropBol</h1>
      <p className="text-lg text-center text-gray-600 mb-12">
        Esta es la página de inicio. Comienza a construir tu aplicación aquí.
      </p>
      {/*Contenedor del Panel de Filtros*/}
    <div className="relative" style={{ left: '-150px' }}> 
        <FilterPanel />
      </div>
      
    </div>
import { HomeBanner } from '@/components/home/HomeBanner'
import ExploreSection from '@/components/layout/ExploreSection'

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
  const mainBanner = banners[0] // Tomamos el primero por ahora de la base de datos

  return (
    <main className="flex min-h-screen flex-col items-center">
      {mainBanner && (
        <HomeBanner
          url={mainBanner.urlImagen}
          title={mainBanner.titulo || 'Encuentra tu lugar ideal en Bolivia'}
          subtitle={
            mainBanner.subtitulo || 'Compra, vende o alquila propiedades de forma rápida y segura'
          }
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <ExploreSection />
      </div>
    </main>
  )
}