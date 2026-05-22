import { TelemetriaRepository } from './telemetria.repository.js'
import { SearchTelemetriaData, ClickTelemetriaData } from './telemetria.types.js'

export class TelemetriaService {
  private repository: TelemetriaRepository

  constructor() {
    this.repository = new TelemetriaRepository()
  }

  async trackSearch(usuarioId: number | null, ip: string, searchData: SearchTelemetriaData) {
    return await this.repository.guardarBusqueda(usuarioId, ip, {
      ...searchData,
      timestamp: new Date().toISOString()
    })
  }

  async trackClick(usuarioId: number, clickData: ClickTelemetriaData) {
    return await this.repository.registrarClickInmueble(usuarioId, clickData.inmuebleId)
  }

  async getRecomendados(usuarioId?: number): Promise<number[]> {
    return await this.repository.obtenerInmueblesRecomendados(usuarioId)
  }
}
