'use client'

import { useState, useEffect } from 'react'
import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'
import { Inmueble } from '../../types/inmueble'

export const ResultadosBusqueda = () => {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/inmuebles')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setInmuebles(data.data)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles
  })

  if (cargando) return <p className="p-8 text-gray-500">Cargando propiedades...</p>

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MenuOrdenamiento
        ordenActual={ordenActual}
        onOrdenChange={cambiarOrden}
        totalResultados={inmueblesOrdenados.length}
      />
      {inmueblesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {inmueblesOrdenados.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron propiedades.</p>
        </div>
      )}
    </div>
  )
}