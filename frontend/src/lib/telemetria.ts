interface SearchData {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  zona?: string
  precioMin?: number
  precioMax?: number
}

interface ClickData {
  inmuebleId: number
  posicionLista?: number
}

class TelemetriaClient {
  async trackSearch(data: SearchData) {
    try {
      await fetch('/api/telemetria/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          url: window.location.pathname
        })
      })
    } catch (error) {
      console.error('[Telemetria] Error en trackSearch:', error)
    }
  }

  async trackClick(data: ClickData) {
    try {
      const token = localStorage.getItem('token')

      await fetch('/api/telemetria/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('[Telemetria] Error en trackClick:', error)
    }
  }
}

export const telemetria = new TelemetriaClient()
