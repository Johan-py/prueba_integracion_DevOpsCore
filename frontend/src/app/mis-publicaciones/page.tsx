'use client'

import { useState, useEffect } from 'react'
import PublicacionCard from '@/components/publicacion/PublicacionCard'
import { publicacionService } from '@/services/publicacionn.service'
import type { MisPublicacionesItem } from '@/types/publicacion'

// NUEVO: Agregar tipo 'promocionadas'
type TabType = 'todas' | 'activas' | 'pausadas' | 'promocionadas'

export default function MisPublicacionesList() {
  const [publicaciones, setPublicaciones] = useState<MisPublicacionesItem[]>([])
  const [estadisticas, setEstadisticas] = useState<{
    totalPublicaciones: number
    limite: number
    disponibles: number
    tieneSuscripcion: boolean
    suscripcion: {
      id: number
      planNombre: string
      fechaInicio: string
      fechaFin: string
    } | null
  }>({
    totalPublicaciones: 0,
    limite: 3,
    disponibles: 0,
    tieneSuscripcion: false,
    suscripcion: null
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // NUEVO: Actualizar tipo de filtro
  const [filtro, setFiltro] = useState<TabType>('todas')

  const transformarPublicacion = (pub: any): MisPublicacionesItem => {
    return {
      id: pub.id,
      titulo: pub.titulo,
      precio: Number(pub.precio ?? pub.inmueble?.precio ?? 0),
      ubicacion:
        pub.ubicacion ||
        pub.inmueble?.ubicacion?.direccion ||
        pub.inmueble?.ubicacion?.zona ||
        'Ubicación no especificada',
      nroBanos: pub.nroBanos ?? pub.inmueble?.nroBanos ?? null,
      nroCuartos: pub.nroCuartos ?? pub.inmueble?.nroCuartos ?? null,
      superficieM2:
        pub.superficieM2 ??
        (pub.inmueble?.superficieM2 ? Number(pub.inmueble.superficieM2) : null),
      imagenUrl: pub.imagenUrl || pub.multimedia?.[0]?.url || pub.usuario?.avatar || null,
      tipoOperacion: pub.tipoOperacion || pub.inmueble?.tipoAccion || 'VENTA',
      activa: pub.estado ? pub.estado === 'ACTIVA' : pub.activa,
      // NUEVO: Agregar promoted
      promoted: pub.promoted ?? false,
      totalVisualizaciones: Number(pub.totalVisualizaciones ?? 0),
      totalCompartidos: Number(pub.totalCompartidos ?? 0),
      metricas: pub.metricas || {
        visitas: 0,
        favoritos: 0,
        contactos: 0
      }
    }
  }

  const cargarPublicaciones = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await publicacionService.obtenerMisPublicacionesConEstadisticas()

      const publicacionesTransformadas = data
        .filter((pub: any) => pub.estado !== 'ELIMINADA')
        .map(transformarPublicacion)

      setPublicaciones(publicacionesTransformadas)

      // NUEVO: Filtrar activas excluyendo promocionadas
      const publicacionesActivasCalculadas = publicacionesTransformadas.filter(
        (pub: MisPublicacionesItem) => pub.activa === true && !pub.promoted
      )

      setEstadisticas((prev) => ({
        ...prev,
        totalPublicaciones: publicacionesTransformadas.length,
        limite: estadisticas.tieneSuscripcion ? estadisticas.limite : Math.max(3, publicacionesActivasCalculadas.length),
        disponibles: Math.max(
          0,
          (estadisticas.tieneSuscripcion ? estadisticas.limite : Math.max(3, publicacionesActivasCalculadas.length)) -
            publicacionesActivasCalculadas.length
        )
      }))
    } catch (error) {
      console.error('Error cargando publicaciones:', error)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleted = (id: number) => {
    setPublicaciones(prev => prev.filter(p => p.id !== id))
  }

  const handleEstadoChange = (id: number, nuevoEstado: boolean) => {
    setPublicaciones(prev =>
      prev.map(p => (p.id === id ? { ...p, activa: nuevoEstado } : p))
    )
  }

  // NUEVO: Manejador para cambio de promoción
  const handlePromocionChange = (id: number, promoted: boolean) => {
    setPublicaciones(prev =>
      prev.map(p => (p.id === id ? { ...p, promoted } : p))
    )
    
    if (!promoted) {
      setFiltro('activas')
    } else {
      setFiltro('promocionadas')
    }
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [])

  // NUEVO: Función para contar según la pestaña
  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'activas':
        return publicaciones.filter(p => p.activa === true && !p.promoted).length
      case 'pausadas':
        return publicaciones.filter(p => p.activa === false).length
      case 'promocionadas':
        return publicaciones.filter(p => p.promoted === true).length
      default:
        return publicaciones.length
    }
  }

  // NUEVO: Filtrar según la pestaña seleccionada
  const publicacionesFiltradas = publicaciones.filter(p => {
    if (filtro === 'activas') return p.activa === true && !p.promoted
    if (filtro === 'pausadas') return p.activa === false
    if (filtro === 'promocionadas') return p.promoted === true
    return true
  })

  const publicacionesActivas = publicaciones.filter(p => p.activa === true && !p.promoted)

  const limiteMostrado = estadisticas.tieneSuscripcion
    ? estadisticas.limite
    : Math.max(3, publicacionesActivas.length)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Cargando publicaciones...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={cargarPublicaciones}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl">
        <h3 className="font-semibold text-gray-800">
          Mi Plan actual:{' '}
          {estadisticas.suscripcion?.planNombre
            ? `${estadisticas.suscripcion.planNombre} ⭐`
            : 'Básico (Gratis)'}
        </h3>

        <p className="text-sm text-gray-600">
          Publicaciones Activas: {publicacionesActivas.length} / {limiteMostrado}
          {publicacionesActivas.length >= limiteMostrado && (
            <span className="text-yellow-600 ml-2">(Límite alcanzado)</span>
          )}
        </p>
        
        {/* NUEVO: Contador de publicaciones en publicidad */}
        <p className="text-sm text-gray-600 mt-1">
          En Publicidad: {publicaciones.filter(p => p.promoted === true).length}
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            filtro === 'todas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({getTabCount('todas')})
        </button>

        <button
          onClick={() => setFiltro('activas')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            filtro === 'activas'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Activas ({getTabCount('activas')})
        </button>

        <button
          onClick={() => setFiltro('pausadas')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            filtro === 'pausadas'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pausadas ({getTabCount('pausadas')})
        </button>

        {/* NUEVO: Pestaña Publicidad */}
        <button
          onClick={() => setFiltro('promocionadas')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            filtro === 'promocionadas'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Publicidad ({getTabCount('promocionadas')})
        </button>
      </div>

      {publicacionesFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {filtro === 'todas' && 'No tienes publicaciones.'}
            {filtro === 'activas' && 'No tienes publicaciones activas.'}
            {filtro === 'pausadas' && 'No tienes publicaciones pausadas.'}
            {filtro === 'promocionadas' && 'No tienes propiedades en publicidad.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicacionesFiltradas.map(pub => (
            <PublicacionCard
              key={pub.id}
              publicacion={pub}
              onDeleted={handleDeleted}
              onEstadoChange={handleEstadoChange}
              // NUEVO: Props para HU-11
              onPromocionChange={handlePromocionChange}
              showPromoteButton={filtro === 'activas'}
              showCancelPromoteButton={filtro === 'promocionadas'}
            />
          ))}
        </div>
      )}
    </div>
  )
}