'use client'

import { useState, useEffect } from 'react'

interface Sesion {
  id: number
  token: string
  fechaInicio: string
  fechaExpiracion: string
  estado: boolean
  metodoAuth: string
  esActual: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ActiveSessions() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [seleccionadas, setSeleccionadas] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('token')

  // ── GET: Cargar sesiones ──────────────────────────────
  const cargarSesiones = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        // Mock si no hay token
        setSesiones([
          { id: 1, token: 'mock', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: true },
          { id: 2, token: 'mock2', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: false },
          { id: 3, token: 'mock3', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: false },
        ])
        return
      }

      const res = await fetch(`${API_URL}/api/sesion/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      // Verificar si la respuesta es JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Respuesta no JSON:', text.substring(0, 200))
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`)
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      if (data.sesiones && Array.isArray(data.sesiones)) {
        setSesiones(data.sesiones)
      } else if (Array.isArray(data)) {
        setSesiones(data)
      } else {
        throw new Error('Formato de respuesta inválido')
      }
    } catch (err: any) {
      console.error('Error cargando sesiones:', err)
      setError(err.message || 'Error al cargar sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
     cargarSesiones()

  const interval = setInterval(() => {
    cargarSesiones()
  }, 10000) // cada 10 segundos

  return () => clearInterval(interval)

  }, [])

  // ── Seleccionar / deseleccionar ───────────────────────
  const toggleSeleccion = (id: number, esActual: boolean) => {
    if (esActual) return
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const seleccionarTodas = () => {
    const idsActivas = sesiones
      .filter(s => !s.esActual)
      .map(s => s.id)
    if (seleccionadas.length === idsActivas.length) {
      setSeleccionadas([])
    } else {
      setSeleccionadas(idsActivas)
    }
  }

  // ── DELETE: Cerrar sesiones seleccionadas ─────────────
  const cerrarSesiones = async () => {
    if (seleccionadas.length === 0) return
       const confirmar = window.confirm(
                `¿Estás seguro de cerrar ${
             seleccionadas.length > 1
                  ? 'las sesiones seleccionadas'
                  : 'la sesión seleccionada'
              }?`
        )

  if (!confirmar) return

    setIsLoading(true)
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Usar Promise.all para mejor rendimiento
      const promises = seleccionadas.map(id =>
        fetch(`${API_URL}/api/sesion/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      )

      const responses = await Promise.all(promises)
      const failed = responses.filter(r => !r.ok)

      if (failed.length > 0) {
        throw new Error(`Fallaron ${failed.length} cierres de sesión`)
      }

      // Actualizar estado local
      setSesiones(prev => prev.filter(s => !seleccionadas.includes(s.id)))
      setSeleccionadas([])

    } catch (err: any) {
      console.error('Error cerrando sesiones:', err)
      setError(err.message || 'Error al cerrar sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  // ── DELETE: Cerrar todas excepto actual ───────────────
  const cerrarTodas = async () => {
    const confirmar = window.confirm(
         '¿Estás seguro de cerrar todas las sesiones activas?'
     )

  if (!confirmar) return
    setIsLoading(true)
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const res = await fetch(`${API_URL}/api/sesion/cerrar/todas`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al cerrar todas las sesiones')
      }

      // Mantener solo la sesión actual
      setSesiones(prev => prev.filter(s => s.esActual && s.estado))
      setSeleccionadas([])

    } catch (err: any) {
      console.error('Error cerrando todas:', err)
      setError(err.message || 'Error al cerrar todas las sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Formatear fecha ───────────────────────────────────
  const formatearFecha = (fecha: string) => {
    try {
      const diff = Date.now() - new Date(fecha).getTime()
      const minutos = Math.floor(diff / 60000)
      const horas = Math.floor(diff / 3600000)
      const dias = Math.floor(diff / 86400000)

      if (minutos < 1) return 'Hace unos segundos'
      if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
      if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
      return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`
    } catch {
      return 'Fecha desconocida'
    }
  }

  const todasSeleccionadas = sesiones.filter(s => s.estado && !s.esActual).length > 0 &&
    seleccionadas.length === sesiones.filter(s => s.estado && !s.esActual).length

  const sesionesActivasCount = sesiones.filter(s => s.estado).length

  return (
    <div className="min-h-screen bg-[#EAEAEA] p-4">
      <div className="bg-[#D9D9D9] rounded-sm p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">
            Gestión de Sesiones Activas
          </h1>
          <p className="text-lg text-black mt-2">
            {sesiones.length} {sesiones.length === 1 ? 'sesión activa' : 'sesiones activas'}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* LOADING */}
        {isLoading && sesiones.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sesiones.length === 0 && !isLoading ? (
          <div className="bg-[#F4F4F4] rounded-2xl p-8 text-center">
            <p className="text-gray-600 text-lg">No hay sesiones activas</p>
          </div>
        ) : (
          <div className="bg-[#F4F4F4] rounded-2xl p-8 overflow-x-auto">

            {/* HEADER TABLA */}
            <div className="max-w-5xl min-w-[700px] mx-auto grid grid-cols-4 bg-[#E8962F] text-white font-bold rounded-lg py-4 px-6 mb-4 text-center text-lg">
              <p>ID</p>
              <p>Última actividad</p>
              <p>Estado</p>
              <p>Seleccionar</p>
            </div>

            {/* FILAS */}
            <div className="space-y-3">
              {sesiones 
                    .filter((sesion) => sesion.estado)
                    .map((sesion) => (
                <div
                  key={sesion.id}
                  className={`max-w-5xl min-w-[700px] mx-auto grid grid-cols-4 items-center rounded-lg py-5 px-6 text-center text-lg transition-colors
                    ${seleccionadas.includes(sesion.id)
                      ? 'bg-amber-100'
                      : 'bg-[#E7DFD7]'
                    }`}
                >
                  <p className="font-medium">{sesion.id}</p>
                  <p>{formatearFecha(sesion.fechaInicio)}</p>
                  <p>
                    {sesion.esActual ? (
                      <span className="text-green-600 font-semibold">✓ Sesión actual</span>
                    ) : (
                      <span className="text-blue-600">Activa</span>
                    )}
                  </p>

                  <div className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(sesion.id)}
                      onChange={() => toggleSeleccion(sesion.id, sesion.esActual)}
                      disabled={sesion.esActual}
                      className={`w-5 h-5 accent-amber-500 ${sesion.esActual
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                        }`}
                    />
                    {sesion.esActual && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        No se puede cerrar
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* BOTONES */}
        {sesiones.length > 0 && (
          <div className="flex flex-col items-end mt-10 gap-5 max-w-5xl mx-auto">
            <button
              onClick={seleccionarTodas}
              disabled={sesionesActivasCount === 0}
              className="bg-[#CFCFCF] hover:bg-[#BDBDBD] transition px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>

            <div className="flex gap-4">
              <button
                onClick={cerrarTodas}
                disabled={sesionesActivasCount === 0 || isLoading}
                className="bg-[#CFCFCF] hover:bg-[#BDBDBD] transition px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cerrar todas
              </button>

              <button
                onClick={cerrarSesiones}
                disabled={seleccionadas.length === 0 || isLoading}
                className={`transition px-12 py-3 rounded-lg text-xl font-bold text-white
                  ${seleccionadas.length === 0 || isLoading
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-[#EC7467] hover:bg-[#df6557]'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cerrando...
                  </span>
                ) : (
                  `Cerrar${seleccionadas.length > 1 ? ' todas' : ''}${seleccionadas.length > 0 ? ` (${seleccionadas.length})` : ''}`
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}