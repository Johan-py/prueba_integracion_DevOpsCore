'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import FiltrosEstadisticas from './components/FiltrosEstadisticas'
import DashboardResultados from './components/DashboardResultados'

const MapaSeleccionZona = dynamic(() => import('./components/MapaSeleccionZona'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-gray-500 animate-pulse">Cargando mapa…</div>
    </div>
  )
})

export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETO'

export interface ZonaSeleccionada {
  id: number
  nombre: string
}

export interface EstadisticasData {
  zona: { id: number; nombre: string }
  tipoOperacion: string
  promedioPrecio: number
  totalPropiedades: number
  precioMinimo: number
  precioMaximo: number
  evolucionPrecios: { mes: string; promedio: number }[]
  distribucionPorCategoria: { categoria: string; cantidad: number; porcentaje: number }[]
}

// ─── Utilidad MOCK: Generador de datos aleatorios para demostración (Bug 6) ───
const generarMockEstadisticas = (zona: ZonaSeleccionada, tipo: TipoOperacion): EstadisticasData => {
  // Ajustar rangos base según tipo de operación para que tenga sentido real
  const multiplicadorPrecio = tipo === 'VENTA' ? 1000 : tipo === 'ANTICRETO' ? 100 : 10;
  
  // Variables aleatorias base
  const totalPropiedades = Math.floor(Math.random() * (250 - 15 + 1)) + 15;
  const precioBase = (Math.floor(Math.random() * (150 - 30 + 1)) + 30) * multiplicadorPrecio;
  const variacionMinima = Math.floor(Math.random() * 0.4 * precioBase); // Hasta 40% menos
  const variacionMaxima = Math.floor(Math.random() * 0.8 * precioBase); // Hasta 80% más

  const precioMinimo = precioBase - variacionMinima;
  const precioMaximo = precioBase + variacionMaxima;
  
  // Generar evolución de 6 meses con fluctuaciones realistas
  const meses = ['Nov 2023', 'Dic 2023', 'Ene 2024', 'Feb 2024', 'Mar 2024', 'Abr 2024'];
  const evolucionPrecios = meses.map(mes => {
    // Fluctuación entre -10% y +10% del precio base
    const fluctuacion = precioBase * ((Math.random() * 0.2) - 0.1); 
    return {
      mes,
      promedio: Math.round(precioBase + fluctuacion)
    };
  });

  // Generar distribución asegurando que sumen 100%
  const pctDeptos = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
  const pctCasas = Math.floor(Math.random() * (80 - pctDeptos - 10 + 1)) + 10;
  const pctRestante = 100 - pctDeptos - pctCasas;
  const pctOficinas = Math.floor(pctRestante * 0.6);
  const pctLocales = pctRestante - pctOficinas;

  return {
    zona: { id: zona.id, nombre: zona.nombre },
    tipoOperacion: tipo,
    promedioPrecio: precioBase,
    totalPropiedades,
    precioMinimo,
    precioMaximo,
    evolucionPrecios,
    distribucionPorCategoria: [
      { categoria: 'Departamentos', porcentaje: pctDeptos, cantidad: Math.floor(totalPropiedades * (pctDeptos/100)) },
      { categoria: 'Casas', porcentaje: pctCasas, cantidad: Math.floor(totalPropiedades * (pctCasas/100)) },
      { categoria: 'Oficinas', porcentaje: pctOficinas, cantidad: Math.floor(totalPropiedades * (pctOficinas/100)) },
      { categoria: 'Locales', porcentaje: pctLocales, cantidad: Math.floor(totalPropiedades * (pctLocales/100)) }
    ]
  };
}

export default function EstadisticasZonaPage() {
  const router = useRouter()

  // ─── Estado principal ───────────────────────────────────────────────
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaSeleccionada | null>(null)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('VENTA')
  const [mostrarMapa, setMostrarMapa] = useState(false)

  // ─── Estado de resultados ────────────────────────────────────────────
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [sinDatos, setSinDatos] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrandoResultados, setMostrandoResultados] = useState(false)

  // ─── Consultar estadísticas (MOCK Implementado para Demo) ────────────
  const consultarEstadisticas = useCallback(() => {
    if (!zonaSeleccionada || !tipoOperacion) return

    setCargando(true)
    setError(null)
    setSinDatos(false)

    // Simulamos un retraso de red de 800ms para dar la sensación de carga real
    setTimeout(() => {
      try {
        // Simulamos un 5% de probabilidad de que una zona no tenga datos para probar el Bug 5
        const simularFallo = Math.random() < 0.05;

        if (simularFallo) {
          setSinDatos(true)
          setEstadisticas(null)
          setMostrandoResultados(true)
        } else {
          // Generamos los datos aleatorios
          const datosMock = generarMockEstadisticas(zonaSeleccionada, tipoOperacion);
          setEstadisticas(datosMock)
          setMostrandoResultados(true)
        }
      } catch (err) {
        setError('Error al generar la simulación de datos.')
      } finally {
        setCargando(false)
      }
    }, 800)

  }, [zonaSeleccionada, tipoOperacion])

  // ─── Cambiar filtros (CA 11) ─────────────────────────────────────────
  const handleCambiarFiltros = () => {
    setMostrandoResultados(false)
    setEstadisticas(null)
    setSinDatos(false)
    setError(null)
  }

  // ─── Selección de zona desde mapa ────────────────────────────────────
  const handleSeleccionarZonaDesdemapa = (zona: ZonaSeleccionada) => {
    setZonaSeleccionada(zona)
    setMostrarMapa(false)
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col bg-[#FAF8F5]">
      {/* Mapa modal */}
      {mostrarMapa && (
        <MapaSeleccionZona
          zonaActual={zonaSeleccionada}
          tipoOperacion={tipoOperacion}
          onSeleccionar={handleSeleccionarZonaDesdemapa}
          onCerrar={() => setMostrarMapa(false)}
          onTipoOperacionChange={setTipoOperacion}
          onVerEstadisticas={() => {
            setMostrarMapa(false)
            consultarEstadisticas()
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 flex-grow w-full">
        {/* Back button */}
        <button
          onClick={() => (mostrandoResultados ? handleCambiarFiltros() : router.back())}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          id="btn-volver-estadisticas"
        >
          <ArrowLeft size={16} />
          {mostrandoResultados ? 'Volver' : 'Volver al inicio'}
        </button>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estadísticas de propiedades por zona
          </h1>
          <p className="text-gray-500 text-sm">
            Consulta el promedio de precios según ubicación y tipo de operación.
          </p>
        </div>

        {/* Vista: Filtros (CA 5 - se muestran antes de consultar) */}
        {!mostrandoResultados && (
          <FiltrosEstadisticas
            zonaSeleccionada={zonaSeleccionada}
            tipoOperacion={tipoOperacion}
            cargando={cargando}
            error={error}
            onZonaChange={setZonaSeleccionada}
            onTipoOperacionChange={setTipoOperacion}
            onConsultar={consultarEstadisticas}
            onAbrirMapa={() => setMostrarMapa(true)}
          />
        )}

        {/* Vista: Dashboard de resultados (CA 7, 8, 9, 10) */}
        {mostrandoResultados && (
          <DashboardResultados
            estadisticas={estadisticas}
            sinDatos={sinDatos}
            zona={zonaSeleccionada}
            tipoOperacion={tipoOperacion}
            onCambiarFiltros={handleCambiarFiltros}
          />
        )}
      </div>
    </main>
  )
}