import { prisma } from '../../lib/prisma.client.js'

// Tipo local para no depender del cliente Prisma generado
export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETO'

export interface EstadisticasZonaParams {
  zonaId: number
  tipoOperacion: TipoOperacion
}

export interface EvolucionMes {
  mes: string
  promedio: number
}

export interface DistribucionCategoria {
  categoria: string
  cantidad: number
  porcentaje: number
}

export interface EstadisticasZonaResult {
  zona: {
    id: number
    nombre: string
  }
  tipoOperacion: string
  promedioPrecio: number
  totalPropiedades: number
  precioMinimo: number
  precioMaximo: number
  evolucionPrecios: EvolucionMes[]
  distribucionPorCategoria: DistribucionCategoria[]
}

// Tipo mínimo del inmueble que necesitamos para las estadísticas
interface InmuebleStats {
  id: number
  precio: { toString: () => string } | number | string
  categoria: string | null
  fechaPublicacion: Date | null
  createdAt: Date | null
}

export const estadisticasZonaService = {
  async getEstadisticas(params: EstadisticasZonaParams): Promise<EstadisticasZonaResult> {
    const { zonaId, tipoOperacion } = params

    // 1. Obtener la zona predefinida
    const zona = await prisma.zonaPredefinida.findUnique({
      where: { id: zonaId }
    })

    if (!zona) {
      throw new Error('ZONA_NO_EXISTE')
    }

    // 2. Buscar zona geográfica por nombre (match aproximado)
    const zonaGeo = await prisma.zona_geografica.findFirst({
      where: {
        nombre: {
          contains: zona.nombre,
          mode: 'insensitive'
        }
      },
      include: { barrios: true }
    })

    // 3. Obtener inmuebles tipados explícitamente
    let inmuebles: InmuebleStats[] = []

    if (zonaGeo && zonaGeo.barrios.length > 0) {
      const barrioIds = zonaGeo.barrios.map((b: { id: number }) => b.id)

      const resultado = await prisma.inmueble.findMany({
        where: {
          tipoAccion: tipoOperacion as 'VENTA' | 'ALQUILER' | 'ANTICRETO',
          ubicacion: {
            barrio_id: { in: barrioIds }
          }
        },
        select: {
          id: true,
          precio: true,
          categoria: true,
          fechaPublicacion: true,
          createdAt: true
        },
        orderBy: { fechaPublicacion: 'asc' }
      })

      // Cast explícito al tipo mínimo que necesitamos
      inmuebles = resultado as InmuebleStats[]
    }

    if (inmuebles.length === 0) {
      throw new Error('SIN_DATOS_SUFICIENTES')
    }

    // 4. Calcular estadísticas generales
    const precios: number[] = inmuebles.map(
      (i: InmuebleStats): number => Number(i.precio)
    )
    const promedioPrecio: number =
      precios.reduce((a: number, b: number): number => a + b, 0) / precios.length
    const precioMinimo: number = Math.min(...precios)
    const precioMaximo: number = Math.max(...precios)

    // 5. Evolución histórica: agrupar por mes (últimos 12 meses)
    const ahora = new Date()
    const hace12Meses = new Date(ahora)
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)

    const inmueblesRecientes: InmuebleStats[] = inmuebles.filter(
      (i: InmuebleStats): boolean => {
        const fecha: Date | null = i.fechaPublicacion ?? i.createdAt
        return fecha !== null && fecha >= hace12Meses
      }
    )

    const porMes: Record<string, number[]> = {}
    for (const inmueble of inmueblesRecientes) {
      const fecha: Date | null = inmueble.fechaPublicacion ?? inmueble.createdAt
      if (!fecha) continue
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      if (!porMes[clave]) porMes[clave] = []
      porMes[clave].push(Number(inmueble.precio))
    }

    const mesesOrdenados = Object.keys(porMes).sort()
    const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const evolucionPrecios: EvolucionMes[] = mesesOrdenados.map((clave: string): EvolucionMes => {
      const [año, mes] = clave.split('-')
      const preiosMes: number[] = porMes[clave] ?? []
      const promedio: number =
        preiosMes.reduce((a: number, b: number): number => a + b, 0) / preiosMes.length
      return {
        mes: `${MESES_ES[parseInt(mes, 10) - 1] ?? mes} ${año}`,
        promedio: Math.round(promedio)
      }
    })

    // 6. Distribución por categoría
    const porCategoria: Record<string, number> = {}
    for (const inmueble of inmuebles) {
      const cat: string = inmueble.categoria ?? 'SIN_CATEGORIA'
      porCategoria[cat] = (porCategoria[cat] ?? 0) + 1
    }

    const total = inmuebles.length
    const NOMBRES_CATEGORIA: Record<string, string> = {
      CASA: 'Casas',
      DEPARTAMENTO: 'Departamentos',
      TERRENO: 'Terrenos',
      OFICINA: 'Oficinas',
      CUARTO: 'Cuartos',
      TERRENO_MORTUORIO: 'Terrenos Mortuorios',
      SIN_CATEGORIA: 'Otros'
    }

    const distribucionPorCategoria: DistribucionCategoria[] = Object.entries(porCategoria).map(
      ([cat, cantidad]: [string, number]): DistribucionCategoria => ({
        categoria: NOMBRES_CATEGORIA[cat] ?? cat,
        cantidad,
        porcentaje: Math.round((cantidad / total) * 100)
      })
    )

    return {
      zona: { id: zona.id, nombre: zona.nombre },
      tipoOperacion,
      promedioPrecio: Math.round(promedioPrecio),
      totalPropiedades: total,
      precioMinimo,
      precioMaximo,
      evolucionPrecios,
      distribucionPorCategoria
    }
  },

  async getZonas() {
    return prisma.zonaPredefinida.findMany({
      where: { activa: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    })
  }
}
