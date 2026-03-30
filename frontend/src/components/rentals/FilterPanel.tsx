'use client'

import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { useFilterLogic } from '@/hooks/useFilterLogic'

interface FilterItem {
  name: string
  count: number
}

// Función para normalizar el texto (Cochabamba, Santa cruz -> Cochabamba, Santa cruz)
const formatName = (text: string) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export default function FilterPanel() {
  const [rentalsData, setRentalsData] = useState<FilterItem[]>([])
  const [salesData, setSalesData] = useState<FilterItem[]>([])
  const [typesData, setTypesData] = useState<FilterItem[]>([])
  const [loading, setLoading] = useState(true)

  // Estado de orden GLOBAL
  const [globalSort, setGlobalSort] = useState<'asc' | 'desc'>('asc')

  const rentalsLogic = useFilterLogic(rentalsData, globalSort)
  const salesLogic = useFilterLogic(salesData, globalSort)
  const typesLogic = useFilterLogic(typesData, globalSort)

  const toggleGlobalSort = () => {
    setGlobalSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/filters')
        const result = await response.json()
        if (result.success) {
          setRentalsData(result.data.rentals)
          setSalesData(result.data.sales)
          setTypesData(result.data.categories)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFilters()
  }, [])

  if (loading)
    return (
      <aside className="w-80 p-6 text-gray-500 font-medium italic font-inter">
        Sincronizando...
      </aside>
    )

  return (
    <aside className="w-full md:w-80 bg-white p-6">
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold font-inter tracking-tight">Filtros</h2>
        </div>
        <button
          onClick={toggleGlobalSort}
          className="text-sm font-medium text-orange-400 hover:text-orange-600 outline-none transition-all font-inter"
        >
          {globalSort === 'asc' ? 'Ordenar A↑' : 'Ordenar A↓'}
        </button>
      </div>

      {/* SECCIÓN: ALQUILERES */}
      <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block font-inter tracking-tight">
          Alquileres
        </h3>
        <div
          className={`flex flex-col gap-2 mt-2 ${rentalsLogic.viewLevel > 2 ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
        >
          {rentalsLogic.visibleData.map((city, index) => (
            <div key={index} className="flex justify-between items-center gap-3">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-base font-medium font-inter">
                {formatName(city.name)} {/* <-- APLICADO AQUÍ */}
              </span>
              <span className="text-gray-400 text-sm font-medium font-inter">
                {city.count.toLocaleString()} casas
              </span>
            </div>
          ))}
          {rentalsLogic.viewLevel < 3 && rentalsData.length > 2 ? (
            <button
              onClick={rentalsLogic.handleSeeMore}
              className="text-sm text-orange-400 underline mt-1 w-fit font-bold font-inter"
            >
              {salesLogic.viewLevel === 1 ? 'Ver más >' : 'Mostrar todo >'}
            </button>
          ) : (
            rentalsData.length > 2 && (
              <button
                onClick={rentalsLogic.handleSeeLess}
                className="text-sm text-orange-400 underline mt-1 w-fit ml-auto font-bold font-inter"
              >
                {'<'} Ver menos
              </button>
            )
          )}
        </div>
      </section>

      {/* SECCIÓN: EN VENTA */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block font-inter tracking-tight">
          En venta
        </h3>
        <div
          className={`flex flex-col gap-2 mt-2 ${salesLogic.viewLevel > 2 ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
        >
          {salesLogic.visibleData.map((city, index) => (
            <div key={index} className="flex justify-between items-center gap-3">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-base font-medium font-inter">
                {formatName(city.name)} {/* <-- APLICADO AQUÍ */}
              </span>
              <span className="text-gray-400 text-sm font-medium font-inter">
                {city.count.toLocaleString()} casas
              </span>
            </div>
          ))}
          {salesLogic.viewLevel < 3 && salesData.length > 2 ? (
            <button
              onClick={salesLogic.handleSeeMore}
              className="text-sm text-orange-400 underline mt-1 w-fit font-bold font-inter"
            >
              {rentalsLogic.viewLevel === 1 ? 'Ver más >' : 'Mostrar todo >'}
            </button>
          ) : (
            salesData.length > 2 && (
              <button
                onClick={salesLogic.handleSeeLess}
                className="text-sm text-orange-400 underline mt-1 w-fit ml-auto font-bold font-inter"
              >
                {'<'} Ver menos
              </button>
            )
          )}
        </div>
      </section>

      {/* SECCIÓN: INMUEBLES */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block font-inter tracking-tight">
          Inmuebles
        </h3>
        <div
          className={`flex flex-col gap-2 mt-2 ${typesLogic.viewLevel > 2 ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
        >
          {typesLogic.visibleData.map((type, index) => (
            <div key={index} className="flex justify-between items-center gap-3">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-base font-medium font-inter">
                {formatName(type.name)} {/* <-- APLICADO AQUÍ */}
              </span>
              <span className="text-gray-400 text-sm font-medium font-inter">
                {type.count.toLocaleString()} prop.
              </span>
            </div>
          ))}
          {typesLogic.viewLevel < 3 && typesData.length > 2 ? (
            <button
              onClick={typesLogic.handleSeeMore}
              className="text-sm text-orange-400 underline mt-1 w-fit font-bold font-inter"
            >
              {typesLogic.viewLevel === 1 ? 'Ver más >' : 'Mostrar todo >'}
            </button>
          ) : (
            typesData.length > 2 && (
              <button
                onClick={typesLogic.handleSeeLess}
                className="text-sm text-orange-400 underline mt-1 w-fit ml-auto font-bold font-inter"
              >
                {'<'} Ver menos
              </button>
            )
          )}
        </div>
      </section>
    </aside>
  )
}
