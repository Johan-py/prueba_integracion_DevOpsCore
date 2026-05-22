import { City } from "@/types/city"

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

type CityApiResponse = {
  id: number
  name: string
  slug: string
  description: string
  locationReference?: string
  popularity?: number
  images: string[]
}

export async function getCities(): Promise<City[]> {
  try {
    const response = await fetch(`${API_URL}/api/cities?limit=6`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`No se pudieron cargar las ciudades destacadas: ${response.status}`)
    }

    const cities: CityApiResponse[] = await response.json()

    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      description: city.description,
      locationReference: city.locationReference,
      popularity: city.popularity,
      images: city.images,
    }))
  } catch (error) {
    console.error("Error cargando ciudades destacadas:", error)
    return []
  }
}
