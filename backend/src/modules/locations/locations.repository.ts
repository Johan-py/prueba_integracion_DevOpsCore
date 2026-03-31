import { prisma } from "../../lib/prisma.js";

type LocationSearchResult = {
  id: number;
  nombre: string;
  municipio: string;
  departamento: string;
};

type LocationRow = {
  id: number;
  zona: string | null;
  ciudad: string | null;
  direccion: string | null;
};

export class LocationsRepository {
  async findByName(query: string): Promise<LocationSearchResult[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const locations: LocationRow[] = await prisma.ubicacionInmueble.findMany({
      where: {
        OR: [
          { zona: { contains: trimmedQuery, mode: "insensitive" } },
          { ciudad: { contains: trimmedQuery, mode: "insensitive" } },
          { direccion: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        zona: true,
        ciudad: true,
        direccion: true,
      },
      take: 5,
    });

    return locations.map((location: LocationRow) => ({
      id: location.id,
      nombre: location.zona ?? location.direccion ?? location.ciudad ?? "",
      municipio: location.ciudad ?? "",
      departamento: "",
    }));
  }
}
