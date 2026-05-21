import { CityRepository } from "./city.repository.js"

export type FeaturedCity = {
  id: number
  name: string
  slug: string
  description: string
  locationReference: string
  popularity: number
  images: string[]
}

const DEFAULT_LIMIT = 6

export class CityService {
  private repository = new CityRepository()

  async getFeatured(limit = DEFAULT_LIMIT): Promise<FeaturedCity[]> {
    const featuredCities = await this.repository.findFeatured(limit)

    return Promise.all(
      featuredCities.map(async (city) => {
        const locationReference = await this.repository.findLocationReference(city.nombre)

        return {
          id: city.id,
          name: city.nombre,
          slug: city.slug,
          description: city.descripcion ?? "Explora propiedades destacadas en esta ciudad.",
          locationReference,
          popularity: city.popularidad ?? 0,
          images: city.ciudad_imagen.map((image) => image.url),
        }
      }),
    )
  }
}
