import { prisma } from "../../lib/prisma.client.js";

export class LocationsRepository {
  // Función auxiliar para generar variaciones con tildes (RegEx simple) --BitPro
  private normalizeQuery(query: string) {
    return query
      .replace(/[aá]/gi, "[aá]")
      .replace(/[eé]/gi, "[eé]")
      .replace(/[ií]/gi, "[ií]")
      .replace(/[oó]/gi, "[oó]")
      .replace(/[uú]/gi, "[uú]");
  }

  async findByName(query: string) {
    try {
      const cleanQuery = query.trim();
      // Si la query es muy corta, devolvemos vacío para evitar carga innecesaria
      if (!cleanQuery || cleanQuery.length < 2) return [];

      // 1. Buscamos coincidencias en Municipios (Ej: "Cochabamba")
      const municipios = await prisma.municipio.findMany({
        where: { nombre: { contains: cleanQuery, mode: "insensitive" } },
        include: {
          provincia: { include: { departamento: true } }
        },
        take: 3,
      });

      // 2. Buscamos coincidencias en Barrios (Ej: "Queru Queru")
      const barrios = await prisma.barrio.findMany({
        where: { nombre: { contains: cleanQuery, mode: "insensitive" } },
        include: {
          zona: {
            include: {
              municipio: {
                include: { provincia: { include: { departamento: true } } }
              }
            }
          }
        },
        take: 4,
      });

      // 3. Mapeamos Municipios al formato que el Frontend espera
      const resultadosMunicipios = municipios.map((m) => ({
        id: m.id + 10000, 
        nombre: m.nombre, 
        municipio: m.nombre,
        // Usamos ?. para evitar el error y ?? para poner un valor por defecto
        departamento: m.provincia?.departamento.nombre ?? "Cochabamba", 
        tipo: "Municipio" 
      }));

      // 4. Mapeamos Barrios al formato que el Frontend espera
      const resultadosBarrios = barrios.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        municipio: b.zona.municipio.nombre,
        departamento: b.zona.municipio.provincia?.departamento.nombre ?? "Cochabamba", 
        tipo: "Barrio"
      }));

      // 5. Unimos los resultados (Priorizando Municipios, luego Barrios)
      return [...resultadosMunicipios, ...resultadosBarrios].slice(0, 5);

    } catch (error) {
      console.error("❌ Error en LocationsRepository.findByName:", error);
      return [];
    }
  }

  /**
   * Incrementa la popularidad de una zona.
   */
  async incrementPopularity(id: number) {
    try {
      return null;
    } catch (error) {
      console.error("❌ Error al incrementar popularidad:", error);
      return null;
    }
  }
}