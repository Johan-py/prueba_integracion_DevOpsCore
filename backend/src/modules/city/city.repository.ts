import { prisma } from "../../lib/prisma.client.js"

type RawFeaturedCity = {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  popularidad: number | null
  ciudad_imagen: Array<{
    url: string
    orden: number | null
  }>
}

export class CityRepository {
  async findFeatured(limit: number) {
    return prisma.ciudad.findMany({
      where: {
        ciudad_imagen: {
          some: {},
        },
      },
      include: {
        ciudad_imagen: {
          select: {
            url: true,
            orden: true,
          },
          orderBy: {
            orden: "asc",
          },
        },
      },
      orderBy: [
        {
          popularidad: "desc",
        },
        {
          nombre: "asc",
        },
      ],
      take: limit,
    }) as Promise<RawFeaturedCity[]>
  }

  async findLocationReference(cityName: string) {
    const locations = await prisma.ubicacionInmueble.findMany({
      where: {
        OR: [
          {
            ciudad: {
              equals: cityName,
              mode: "insensitive",
            },
          },
          {
            ubicacion_maestra: {
              is: {
                nombre: {
                  equals: cityName,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            ubicacion_maestra: {
              is: {
                municipio: {
                  equals: cityName,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      select: {
        zona: true,
        ubicacion_maestra: {
          select: {
            nombre: true,
            municipio: true,
          },
        },
      },
      take: 24,
    })

    const counts = new Map<string, number>()

    for (const location of locations) {
      const candidates = [
        location.zona?.trim(),
        location.ubicacion_maestra?.municipio?.trim(),
        location.ubicacion_maestra?.nombre?.trim(),
      ].filter((value): value is string => Boolean(value))

      for (const candidate of candidates) {
        counts.set(candidate, (counts.get(candidate) ?? 0) + 1)
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([label]) => label)
      .join(", ")
  }
}
