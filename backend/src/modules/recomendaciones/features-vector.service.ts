import { prisma } from '../../lib/prisma.client.js'

export interface ContextoUsuario {
  zonasPreferidas: string[] // zonas más vistas
  categoriasPreferidas: string[] // categorías más interactuadas
  precioPromedio: number // precio promedio de lo que vio
  superficiePromedio: number
  tipoAccionPreferida: string | null // VENTA, ALQUILER, ANTICRETO
  amenidadesPreferidas: number[] // ids de amenidades vistas frecuentemente
}

export interface FeatureVector {
  inmuebleId: number
  vector: number[]
  etiquetas: string[] // para saber qué representa cada posición
}

export class FeaturesVectorService {
  /**
   * Construye el contexto del usuario desde su historial
   */
  async obtenerContextoUsuario(usuarioId: number): Promise<ContextoUsuario> {
    // Últimas 50 vistas
    const vistas = await prisma.propiedad_vista.findMany({
      where: { usuarioId },
      orderBy: { vistaEn: 'desc' },
      take: 50,
      include: {
        inmueble: {
          include: {
            ubicacion: true,
            inmueble_amenidad: true
          }
        }
      }
    })

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      include: {
        inmueble: {
          include: {
            ubicacion: true,
            inmueble_amenidad: true
          }
        }
      }
    })

    // Combinar todos los inmuebles interactuados (favoritos pesan más)
    const todos = [
      ...vistas.map((v) => ({ inmueble: v.inmueble, peso: 1 })),
      ...favoritos.map((f) => ({ inmueble: f.inmueble, peso: 3 }))
    ]

    if (todos.length === 0) {
      return {
        zonasPreferidas: [],
        categoriasPreferidas: [],
        precioPromedio: 0,
        superficiePromedio: 0,
        tipoAccionPreferida: null,
        amenidadesPreferidas: []
      }
    }

    // Contar zonas
    const zonaCount = new Map<string, number>()
    const categoriaCount = new Map<string, number>()
    const tipoAccionCount = new Map<string, number>()
    const amenidadCount = new Map<number, number>()
    let precioTotal = 0,
      superficieTotal = 0,
      count = 0

    for (const { inmueble, peso } of todos) {
      const zona = inmueble.ubicacion?.zona
      if (zona) zonaCount.set(zona, (zonaCount.get(zona) || 0) + peso)

      const cat = inmueble.categoria
      if (cat) categoriaCount.set(cat, (categoriaCount.get(cat) || 0) + peso)

      tipoAccionCount.set(
        inmueble.tipoAccion,
        (tipoAccionCount.get(inmueble.tipoAccion) || 0) + peso
      )

      precioTotal += Number(inmueble.precio) * peso
      superficieTotal += Number(inmueble.superficieM2 || 0) * peso
      count += peso

      for (const a of inmueble.inmueble_amenidad) {
        amenidadCount.set(a.amenidad_id, (amenidadCount.get(a.amenidad_id) || 0) + peso)
      }
    }

    const top = <T>(map: Map<T, number>, n: number): T[] =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k)

    return {
      zonasPreferidas: top(zonaCount, 3),
      categoriasPreferidas: top(categoriaCount, 3),
      precioPromedio: count > 0 ? precioTotal / count : 0,
      superficiePromedio: count > 0 ? superficieTotal / count : 0,
      tipoAccionPreferida: top(tipoAccionCount, 1)[0] ?? null,
      amenidadesPreferidas: top(amenidadCount, 5)
    }
  }

  /**
   * Extrae y normaliza el vector de features de un inmueble dado el contexto del usuario
   */
  async extraerVector(inmuebleId: number, contexto: ContextoUsuario): Promise<FeatureVector> {
    const inmueble = await prisma.inmueble.findUnique({
      where: { id: inmuebleId },
      include: {
        ubicacion: true,
        inmueble_amenidad: true,
        inmueble_etiqueta: { include: { etiqueta: true } }
      }
    })

    if (!inmueble) throw new Error(`Inmueble ${inmuebleId} no encontrado`)

    const categoriaMap: Record<string, number> = {
      CASA: 1,
      DEPARTAMENTO: 2,
      TERRENO: 3,
      OFICINA: 4,
      CUARTO: 5,
      TERRENO_MORTUORIO: 6
    }
    const tipoAccionMap: Record<string, number> = {
      VENTA: 1,
      ALQUILER: 2,
      ANTICRETO: 3
    }

    const precio = Number(inmueble.precio)
    const superficie = Number(inmueble.superficieM2 || 0)
    const zona = inmueble.ubicacion?.zona || ''

    // === FEATURES DEL INMUEBLE ===
    const f_categoria = (categoriaMap[inmueble.categoria || ''] || 0) / 6
    const f_tipoAccion = (tipoAccionMap[inmueble.tipoAccion] || 0) / 3
    const f_precio =
      contexto.precioPromedio > 0
        ? Math.min(precio / (contexto.precioPromedio * 2), 1) // normalizado respecto al promedio del usuario
        : Math.min(precio / 1_000_000, 1)
    const f_superficie =
      contexto.superficiePromedio > 0
        ? Math.min(superficie / (contexto.superficiePromedio * 2), 1)
        : Math.min(superficie / 500, 1)
    const f_cuartos = Math.min((inmueble.nroCuartos || 0) / 10, 1)
    const f_banos = Math.min((inmueble.nroBanos || 0) / 5, 1)

    // === FEATURES DE AFINIDAD CON EL USUARIO ===
    const f_zonaMatch = contexto.zonasPreferidas.includes(zona) ? 1 : 0
    const f_categoriaMatch = contexto.categoriasPreferidas.includes(inmueble.categoria || '')
      ? 1
      : 0
    const f_tipoAccionMatch = contexto.tipoAccionPreferida === inmueble.tipoAccion ? 1 : 0

    // Similitud de precio (qué tan cerca está del promedio que prefiere el usuario)
    const f_similitudPrecio =
      contexto.precioPromedio > 0
        ? Math.max(0, 1 - Math.abs(precio - contexto.precioPromedio) / contexto.precioPromedio)
        : 0

    // Amenidades en común con las preferidas del usuario
    const amenidadesInmueble = new Set(inmueble.inmueble_amenidad.map((a) => a.amenidad_id))
    const amenidadesEnComun = contexto.amenidadesPreferidas.filter((a) =>
      amenidadesInmueble.has(a)
    ).length
    const f_amenidades =
      contexto.amenidadesPreferidas.length > 0
        ? amenidadesEnComun / contexto.amenidadesPreferidas.length
        : 0

    // Precio reducido recientemente (bonus)
    const f_precioReducido =
      inmueble.precio_anterior && Number(inmueble.precio_anterior) > precio ? 1 : 0

    const vector = [
      f_categoria, // 0: tipo de categoría normalizado
      f_tipoAccion, // 1: tipo de acción normalizado
      f_precio, // 2: precio normalizado
      f_superficie, // 3: superficie normalizada
      f_cuartos, // 4: nro cuartos normalizado
      f_banos, // 5: nro baños normalizado
      f_zonaMatch, // 6: afinidad de zona
      f_categoriaMatch, // 7: afinidad de categoría
      f_tipoAccionMatch, // 8: afinidad de tipo acción
      f_similitudPrecio, // 9: similitud de precio con preferencias
      f_amenidades, // 10: overlap de amenidades
      f_precioReducido // 11: precio reducido recientemente
    ]

    return {
      inmuebleId,
      vector,
      etiquetas: [
        'categoria',
        'tipoAccion',
        'precio',
        'superficie',
        'cuartos',
        'banos',
        'zonaMatch',
        'categoriaMatch',
        'tipoAccionMatch',
        'similitudPrecio',
        'amenidades',
        'precioReducido'
      ]
    }
  }

  /**
   * Extrae vectores para múltiples inmuebles usando el mismo contexto
   * (más eficiente que llamar extraerVector uno por uno)
   */
  async extraerVectores(inmuebleIds: number[], usuarioId: number): Promise<FeatureVector[]> {
    const contexto = await this.obtenerContextoUsuario(usuarioId)
    return Promise.all(inmuebleIds.map((id) => this.extraerVector(id, contexto)))
  }
}

export const featuresVectorService = new FeaturesVectorService()
