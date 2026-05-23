import { RecomendacionesRepository } from './recomendaciones.repository.js'
import { ScoreCalculator } from './recomendaciones.utils.js'
import { RecomendacionesParams, InmuebleConScore } from './recomendaciones.types.js'
import { cache } from '../../lib/cache.service.js'
import { featuresService } from './features.service.js'
export class RecomendacionesService {
  private repository: RecomendacionesRepository
  private scoreCalculator: ScoreCalculator

  constructor() {
    this.repository = new RecomendacionesRepository()
    this.scoreCalculator = new ScoreCalculator()
  }

  async getRecomendacionesPorPopularidad(zona: string, limit: number = 20, usuario_id?: number) {
    const populares = await this.repository.getInmueblesPopularesPorZona(zona, limit, usuario_id)
    return populares.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      precio: Number(p.precio),
      superficie_m2: p.superficie_m2 ? Number(p.superficie_m2) : null,
      categoria: p.categoria ?? null,
      ubicacion: p.ubicacion,
      score: 50,
      razones: [`Popular en ${zona} (últimos 7 días)`]
    }))
  }

  async getRecomendacionesGlobales(
    params: RecomendacionesParams & { ia?: boolean }
  ): Promise<InmuebleConScore[]> {
    const { usuario_id, limit = 20, excludeIds = [], zonaForzada, ia, ...filtros } = params
    if (!usuario_id) {
      const zonaAEvaluar = zonaForzada || 'Cochabamba'
      return this.getRecomendacionesPorPopularidad(zonaAEvaluar, limit)
    }

    if (ia) {
      console.log(`[ML] Solicitando recomendaciones con ML para usuario ${usuario_id}`)

      const resultadosML = await featuresService.recomendar(
        Number(usuario_id), // 1er argumento: usuario_id
        limit, // 2do argumento: limit
        {
          // 3er argumento: objeto de filtros
          modoInmueble: Array.isArray(filtros.modoInmueble)
            ? filtros.modoInmueble
            : filtros.modoInmueble
              ? [filtros.modoInmueble as string]
              : undefined,
          query: filtros.query
        }
      )

      if (resultadosML && resultadosML.length > 0) {
         return resultadosML.map(r => ({ ...r, modeloUsado: 'ML' as const }))
      }
      console.log('[ML] Sin resultados suficientes, usando fallback')
    }

    const cacheKey = `recomendaciones_globales_usuario_${usuario_id}_limit_${limit}_zona_${zonaForzada || 'none'}`
    const cached = cache.get<InmuebleConScore[]>(cacheKey)
    if (cached) {
      console.log(`[Cache] Hit para usuario ${usuario_id}`)
      return cached
    }
    console.log(`[Cache] Miss para usuario ${usuario_id}, calculando...`)
    const zonaConexion = await this.repository.getZonaConexionUsuario(usuario_id)
    const historialVistas = await this.repository.getHistorialVistas(usuario_id)
    const ultimasBusquedas = await this.repository.getUltimasBusquedas(usuario_id)
    const favoritos = await this.repository.getFavoritos(usuario_id)
    const favoritosIds = favoritos.map((f: any) => f.id)
    const totalClics = historialVistas.length
    console.log('usuario_id:', usuario_id)
    console.log('historialVistas.length:', historialVistas.length)
    console.log('favoritos.length:', favoritos.length)
    console.log('zonaConexion:', zonaConexion)
    console.log('Modo avanzado:', totalClics >= 5 ? '✅ activado' : '❌ básico')
    if (historialVistas.length === 0 && favoritos.length === 0) {
      const zonaAEvaluar = zonaForzada || zonaConexion
      if (zonaAEvaluar) {
        return await this.getRecomendacionesPorPopularidad(zonaAEvaluar, limit, usuario_id)
      }
      const populares = await this.repository.getInmueblesPopulares(limit)
      return populares.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        precio: Number(p.precio),
        superficie_m2: p.superficie_m2 ? Number(p.superficie_m2) : null,
        categoria: p.categoria ?? null,
        ubicacion: p.ubicacion,
        score: 50,
        razones: ['Popularidad general']
      }))
    }

    const preferencias = this.scoreCalculator.extraerPreferencias(
      historialVistas,
      ultimasBusquedas,
      favoritos
    )

    let candidatos = await this.repository.getInmueblesCandidatos(usuario_id, 100)

    if (zonaConexion) {
      const totalRequeridos = limit
      const minDeZona = Math.ceil(totalRequeridos * 0.6)

      const deZonaConexion = candidatos.filter((c) =>
        c.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      )
      const otrasZonas = candidatos.filter(
        (c) => !c.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      )

      if (deZonaConexion.length < minDeZona) {
        const adicionales = await this.repository.getInmueblesPorZona(
          zonaConexion,
          minDeZona - deZonaConexion.length
        )
        candidatos = [...deZonaConexion, ...otrasZonas, ...adicionales]
      } else {
        candidatos = [...deZonaConexion, ...otrasZonas]
      }
    }

    candidatos = candidatos.filter(
      (c) => !excludeIds.includes(c.id) && !favoritosIds.includes(c.id)
    )

    const inmueblesConScore: InmuebleConScore[] = []

    for (const inmueble of candidatos) {
      const { score, razones } = this.scoreCalculator.calcularScoreAvanzado(
        inmueble,
        preferencias,
        favoritos,
        totalClics
      )
      let scoreFinal = score

      if (
        zonaConexion &&
        inmueble.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      ) {
        scoreFinal += 10
        razones.push(`Zona de conexión (${zonaConexion}) +10pts`)
      }

      if (scoreFinal > 0) {
        inmueblesConScore.push({
          id: inmueble.id,
          titulo: inmueble.titulo,
          precio: Number(inmueble.precio),
          superficie_m2: inmueble.superficie_m2 ? Number(inmueble.superficie_m2) : null,
          categoria: inmueble.categoria ?? null,
          ubicacion: inmueble.ubicacion,
          score: scoreFinal,
          razones
        })
      }
    }

    inmueblesConScore.sort((a, b) => b.score - a.score)
    const resultado = inmueblesConScore.slice(0, limit)
    const resultadoConModelo = resultado.map(r => ({ ...r, modeloUsado: 'REGLAS' as const }))
    cache.set(cacheKey, resultado, 5 * 60 * 1000)
    return resultado
  }

  async ordenarPorAfinidad(inmuebleIds: number[], usuario_id: number): Promise<InmuebleConScore[]> {
    const historialVistas = await this.repository.getHistorialVistas(usuario_id)
    const ultimasBusquedas = await this.repository.getUltimasBusquedas(usuario_id)
    const favoritos = await this.repository.getFavoritos(usuario_id)
    const totalClics = historialVistas.length
    const inmuebles = await this.repository.getInmueblesPorIds(inmuebleIds)

    if (historialVistas.length === 0 && favoritos.length === 0) {
      return inmuebles.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        precio: Number(p.precio),
        superficie_m2: p.superficie_m2 ? Number(p.superficie_m2) : null,
        categoria: p.categoria ?? null,
        ubicacion: p.ubicacion,
        score: 0,
        razones: ['Sin historial']
      }))
    }

    const preferencias = this.scoreCalculator.extraerPreferencias(
      historialVistas,
      ultimasBusquedas,
      favoritos
    )

    const resultado: InmuebleConScore[] = inmuebles.map((inmueble) => {
      // ordenarPorAfinidad también usa el método avanzado para consistencia
      const { score, razones } = this.scoreCalculator.calcularScoreAvanzado(
        inmueble,
        preferencias,
        favoritos,
        totalClics
      )
      return {
        id: inmueble.id,
        titulo: inmueble.titulo,
        precio: Number(inmueble.precio),
        superficie_m2: inmueble.superficie_m2 ? Number(inmueble.superficie_m2) : null,
        categoria: inmueble.categoria ?? null,
        ubicacion: inmueble.ubicacion,
        score,
        razones
      }
    })

    resultado.sort((a, b) => b.score - a.score)
    return resultado
  }
  async getRecomendacionesGlobalesML(params: RecomendacionesParams): Promise<InmuebleConScore[]> {
    const { usuario_id, limit, zonaForzada } = params
    if (!usuario_id) {
      const zona = zonaForzada || 'Cochabamba'
      return this.getRecomendacionesPorPopularidad(zona, limit)
    }
    // Aquí irá la lógica ML (ml-matrix) para usuarios logueados
    // Por ahora, puedes llamar a getRecomendacionesGlobales o a un placeholder
    return this.getRecomendacionesGlobales(params)
  }
}

