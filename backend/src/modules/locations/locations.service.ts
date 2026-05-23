import { LocationsRepository } from './locations.repository.js'
import { prisma } from '../../lib/prisma.client.js'

export class LocationsService {
  private repository = new LocationsRepository();

  async searchLocations(query: string) {
    if (!query || query.length < 2) return [];

    try {
      const sugerencias: any[] = [];

      // ==========================================
      // 1. NIVEL DEPARTAMENTO
      // ==========================================
      const deptos = await prisma.departamento.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { provincia_provincia_departamentoTodepartamento: { take: 4 } },
        take: 1
      });

      if (deptos.length > 0) {
        deptos.forEach(d => {
          sugerencias.push({ id: d.id, nivel: 'DEPARTAMENTO', nombre: d.nombre, contexto: 'Departamento de Bolivia' });
          d.provincia_provincia_departamentoTodepartamento.forEach(p => {
            sugerencias.push({ id: p.id, nivel: 'PROVINCIA', nombre: p.nombre, contexto: `Provincia en ${d.nombre}` });
          });
        });
        return sugerencias.slice(0, 5); // 🛑 CORTA LA CASCADA AQUÍ
      }

      // ==========================================
      // 2. NIVEL PROVINCIA
      // ==========================================
      const provincias = await prisma.provincia.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { departamento_provincia_departamentoTodepartamento: true },
        take: 5
      });

      if (provincias.length > 0) {
        provincias.forEach(p => {
          const deptoNombre = p.departamento_provincia_departamentoTodepartamento?.nombre ?? "Bolivia";
          sugerencias.push({ id: p.id, nivel: 'PROVINCIA', nombre: p.nombre, contexto: `Provincia en ${deptoNombre}` });
        });
        return sugerencias.slice(0, 5); // 🛑 CORTA LA CASCADA AQUÍ
      }

      // ==========================================
      // 3. NIVEL MUNICIPIO
      // ==========================================
      const municipios = await prisma.municipio.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { provincia_municipio_provinciaToprovincia: true },
        take: 5
      });

      if (municipios.length > 0) {
        municipios.forEach(m => {
          const provinciaNombre = m.provincia_municipio_provinciaToprovincia?.nombre ?? "Bolivia";
          sugerencias.push({ id: m.id, nivel: 'MUNICIPIO', nombre: m.nombre, contexto: `Municipio en ${provinciaNombre}` });
        });
        return sugerencias.slice(0, 5); // 🛑 CORTA LA CASCADA AQUÍ
      }

      // ==========================================
      // 4. NIVEL ZONA GEOGRÁFICA
      // ==========================================
      const zonas = await prisma.zona_geografica.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { municipio_zona_geografica_municipioTomunicipio: true },
        take: 5
      });

      if (zonas.length > 0) {
        zonas.forEach(z => {
          const muniNombre = z.municipio_zona_geografica_municipioTomunicipio?.nombre ?? "Bolivia";
          sugerencias.push({ id: z.id, nivel: 'ZONA', nombre: z.nombre, contexto: `Zona en ${muniNombre}` });
        });
        return sugerencias.slice(0, 5); // 🛑 CORTA LA CASCADA AQUÍ
      }

      // ==========================================
      // 5. NIVEL BARRIO (El nivel más profundo)
      // ==========================================
      const barrios = await prisma.barrio.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { 
          zona_geografica: { 
            include: { municipio_zona_geografica_municipioTomunicipio: true } 
          } 
        },
        take: 5
      });

      if (barrios.length > 0) {
        barrios.forEach(b => {
          const zonaNombre = b.zona_geografica?.nombre ?? "";
          const muniNombre = b.zona_geografica?.municipio_zona_geografica_municipioTomunicipio?.nombre ?? "";
          const separador = zonaNombre && muniNombre ? ", " : "";
          sugerencias.push({ 
            id: b.id, 
            nivel: 'BARRIO', 
            nombre: b.nombre, 
            contexto: `Barrio en ${zonaNombre}${separador}${muniNombre}` 
          });
        });
        return sugerencias.slice(0, 5); // 🛑 RETORNO FINAL
      }

      // Si el usuario escribe algo que no existe en ninguna tabla
      return []; 

    } catch (error) {
      console.error("❌ Error grave en searchLocations:", error);
      return [];
    }
  }

  async incrementPopularity(id: number) {
    if (!id) throw new Error("ID de ubicación no proporcionado");
    return await this.repository.incrementPopularity(id);
  }
}