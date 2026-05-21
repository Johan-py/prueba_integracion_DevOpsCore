import { Matrix, SVD } from 'ml-matrix'
import { prisma } from '../../lib/prisma.client.js'

interface InmuebleConScore {
  id: number
  titulo: string
  precio: number
  superficieM2: number | null
  categoria: string | null
  ubicacion: any
  score: number
  razones: string[]
}

export class FeaturesService {
  /**
   * Recomienda inmuebles para un usuario usando similitud de coseno
   * @param usuarioId ID del usuario
   * @param limit Número máximo de resultados
   * @returns Lista de inmuebles con score y razones
   */
  async recomendar(
    usuarioId: number,
    limit: number = 20,
    filtrosActivos?: { modoInmueble?: string[]; query?: string }
  ): Promise<InmuebleConScore[]> {
    try {
      // 1. Obtener el historial de interacciones del usuario
      const historial = await prisma.propiedad_vista.findMany({
        where: { usuarioId: usuarioId },
        select: { inmuebleId: true, vistaEn: true },
        orderBy: { vistaEn: 'desc' },
        take: 50 // últimas 50 vistas
      })

      const favoritos = await prisma.favorito.findMany({
        where: { usuarioId: usuarioId },
        select: { inmuebleId: true }
      })

      // Combinar interacciones (dar más peso a favoritos)

      const interacciones = new Map<number, number>() // inmuebleId -> peso
      const ahora = new Date()
      for (const v of historial) {
        const horasDiff = (ahora.getTime() - new Date(v.vistaEn).getTime()) / (1000 * 3600)
        const pesoRecencia = horasDiff < 1 ? 8 : horasDiff < 24 ? 4 : horasDiff < 168 ? 2 : 1
        interacciones.set(v.inmuebleId, (interacciones.get(v.inmuebleId) || 0) + pesoRecencia)
      }
      for (const f of favoritos) {
        interacciones.set(f.inmuebleId, (interacciones.get(f.inmuebleId) || 0) + 5) // favoritos suman más
      }
      console.log('[ML] Interacciones totales:', interacciones.size)
      console.log('[ML] IDs en interacciones:', Array.from(interacciones.keys()))

      if (interacciones.size === 0) {
        // Sin historial: fallback a populares
        return this.fallbackPopulares(limit)
      }

      const inmueblesInteractuados = Array.from(interacciones.keys())

      // 2. Obtener candidatos (inmuebles similares a los interactuados)
      // Para evitar hacer cálculos pesados, tomamos propiedades de las mismas categorías/zona
      const propiedadesSimilares = await this.obtenerInmueblesCandidatos(
        inmueblesInteractuados,
        limit * 3,
        filtrosActivos
      )

      if (propiedadesSimilares.length === 0) {
        return this.fallbackPopulares(limit)
      }

      // 3. Construir matriz de características para calcular similitud
      //    Cada fila es un inmueble, cada columna es una característica (categoría, precio, superficie, zona)
      const caracteristicas = this.extraerCaracteristicas(propiedadesSimilares)
      const matriz = new Matrix(caracteristicas)

      // 4. Normalizar la matriz (importante para coseno)
      const matrizNorm = this.normalizarMatriz(matriz)

      // 5. Para cada inmueble interactuado, calcular similitud con los candidatos
      //    y acumular scores
      const scores = new Map<number, number>()
      const razonesMap = new Map<number, string[]>()

      for (const idInteractuado of inmueblesInteractuados) {
        const idxInteractuado = propiedadesSimilares.findIndex((p) => p.id === idInteractuado)
        if (idxInteractuado === -1) continue

        const vectorInteractuado = matrizNorm.getRow(idxInteractuado)

        for (let i = 0; i < propiedadesSimilares.length; i++) {
          if (propiedadesSimilares[i].id === idInteractuado) continue // no recomendar el mismo

          const vectorCandidato = matrizNorm.getRow(i)
          const similitud = this.coseno(vectorInteractuado, vectorCandidato)
          const peso = interacciones.get(idInteractuado) || 1
          const scoreActual = scores.get(propiedadesSimilares[i].id) || 0
          scores.set(propiedadesSimilares[i].id, scoreActual + similitud * peso)

          // Acumular razones (solo las más significativas, evitar duplicados)
          const razones = razonesMap.get(propiedadesSimilares[i].id) || []
          if (
            similitud > 0.3 &&
            !razones.includes(`Similar a "${this.obtenerTitulo(idInteractuado)}"`)
          ) {
            razones.push(
              `Basado en propiedad vista anteriormente (${(similitud * 100).toFixed(0)} % similitud)`
            )
            razonesMap.set(propiedadesSimilares[i].id, razones)
          }
        }
      }

      // 6. Ordenar por score y devolver top limit
      const resultados = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id, score]) => {
          const propiedad = propiedadesSimilares.find((p) => p.id === id)!
          return {
            id: propiedad.id,
            titulo: propiedad.titulo,
            precio: Number(propiedad.precio),
            superficieM2: propiedad.superficieM2,
            categoria: propiedad.categoria,
            ubicacion: propiedad.ubicacion,
            score: Math.round(score * 100) / 100,
            razones: razonesMap.get(id) || ['Recomendado automático']
          }
        })

      return resultados
    } catch (error) {
      console.error('Error en featuresService.recomendar:', error)
      return this.fallbackPopulares(limit)
    }
  }

  /**
   * Obtiene inmuebles candidatos (similares a los que el usuario ya ha interactuado)
   */
  private async obtenerInmueblesCandidatos(
    idsInteractuados: number[],
    limite: number,
    filtrosActivos?: { modoInmueble?: string[]; query?: string }
  ): Promise<any[]> {
    // Estrategia simple: obtener propiedades de las mismas categorías y zonas
    const interactuados = await prisma.inmueble.findMany({
      where: { id: { in: idsInteractuados } },
      select: { categoria: true, ubicacion: true }
    })

    const categorias = [
      ...new Set(
        interactuados.map((i) => i.categoria).filter((c): c is NonNullable<typeof c> => c !== null)
      )
    ]

    console.log('[ML] IDs interactuados:', idsInteractuados)
    console.log('[ML] Categorías encontradas:', categorias) 


    const whereCategoria = categorias.length > 0 
    ? { in: categorias } 
    : undefined  // ← AGREGAR ESTO

    const where: any = {
    id: { notIn: idsInteractuados },
    estado: 'ACTIVO',
    ...(whereCategoria ? { categoria: whereCategoria } : {})  // ← CAMBIAR ESTO
  }

  
    if (filtrosActivos?.modoInmueble && filtrosActivos.modoInmueble.length > 0) {
      where.tipoAccion = { in: filtrosActivos.modoInmueble }
    }

    if (filtrosActivos?.query && filtrosActivos.query.trim() !== '') {
      const texto = filtrosActivos.query.trim()
      where.OR = [
        { ubicacion: { zona: { contains: texto, mode: 'insensitive' } } },
        { ubicacion: { direccion: { contains: texto, mode: 'insensitive' } } },
        { titulo: { contains: texto, mode: 'insensitive' } }
      ]
    }

    const candidatos = await prisma.inmueble.findMany({
      where,
      take: limite,
      include: { ubicacion: true }
    })

    return candidatos
  }

  /**
   * Extrae vectores de características numéricas para cada inmueble
   */
  private extraerCaracteristicas(inmuebles: any[]): number[][] {
    // Mapear categorías a números
    const categoriasMap = new Map<string, number>([
      ['CASA', 1],
      ['DEPARTAMENTO', 2],
      ['TERRENO', 3],
      ['CUARTO', 4],
      ['TERRENO_MORTUORIO', 5]
    ])

    // Normalizar precios y superficies (valores de ejemplo, ajusta según tus rangos)
    const maxPrice = Math.max(...inmuebles.map((p) => Number(p.precio) || 0))
    const maxSuperficie = Math.max(...inmuebles.map((p) => Number(p.superficieM2) || 0))

    return inmuebles.map((inm) => {
      const precioNorm = Number(inm.precio) / (maxPrice || 1)
      const superficieNorm = (Number(inm.superficieM2) || 0) / (maxSuperficie || 1)
      const categoriaVal = categoriasMap.get(inm.categoria || '') || 0
      // Puedes agregar más características: zona (hash), número de cuartos, baños, etc.
      return [categoriaVal, precioNorm, superficieNorm]
    })
  }

  /**
   * Normaliza una matriz (filas a vector unitario)
   */
  private normalizarMatriz(matriz: Matrix): Matrix {
    const normalized = Matrix.zeros(matriz.rows, matriz.columns)
    for (let i = 0; i < matriz.rows; i++) {
      const row = matriz.getRow(i)
      const norm = Math.hypot(...row)
      if (norm > 0) {
        for (let j = 0; j < matriz.columns; j++) {
          normalized.set(i, j, row[j] / norm)
        }
      }
    }
    return normalized
  }

  /**
   * Calcula la similitud del coseno entre dos vectores
   */
  private coseno(vecA: number[], vecB: number[]): number {
    let dot = 0,
      magA = 0,
      magB = 0
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i]
      magA += vecA[i] ** 2
      magB += vecB[i] ** 2
    }
    if (magA === 0 || magB === 0) return 0
    return dot / (Math.sqrt(magA) * Math.sqrt(magB))
  }

  /**
   * Obtiene el título de un inmueble por su ID (para las razones)
   */
  private async obtenerTitulo(id: number): Promise<string> {
    const inm = await prisma.inmueble.findUnique({ where: { id }, select: { titulo: true } })
    return inm?.titulo || `propiedad ${id}`
  }

  /**
   * Fallback: recomendar propiedades populares
   */
  private async fallbackPopulares(limit: number): Promise<InmuebleConScore[]> {
    const fechaPublicacion = await prisma.inmueble.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { fechaPublicacion: 'desc' }, // asumiendo campo popularidad
      take: limit,
      include: { ubicacion: true }
    })
    return fechaPublicacion.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      precio: Number(p.precio),
      superficieM2: p.superficieM2 ? Number(p.superficieM2) : null,
      categoria: p.categoria,
      ubicacion: p.ubicacion,
      score: 50,
      razones: ['Popularidad general']
    }))
  }
}

export const featuresService = new FeaturesService()
