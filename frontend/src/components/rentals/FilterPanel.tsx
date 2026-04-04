'use client'
import { useState, useEffect } from 'react'
import { useFilterLogic } from '@/hooks/useFilterLogic'

interface FilterItem {
  name: string
  count: number
}

const formatName = (text: string) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

interface FilterSectionProps {
  title: string
  data: FilterItem[]
  logic: ReturnType<typeof useFilterLogic>
  itemLabel: string
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, data, logic, itemLabel }) => {
  return (
    <section>
      <h3 className="text-lg font-bold text-black mb-1.5 underline underline-offset-4 inline-block font-inter tracking-tight">
        {title}
      </h3>
      <div
        className={`flex flex-col gap-1.5 mt-1 ${logic.viewLevel > 2 ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
      >
        {logic.visibleData.map((item: FilterItem) => (
          <div
            key={item.name}
            className="flex justify-between items-center gap-3 group cursor-pointer transition-all"
          >
            <span className="text-gray-600 group-hover:text-gray-900 text-sm font-medium font-inter transition-all">
              {formatName(item.name)}
            </span>
            <span className="text-gray-500 text-sm font-medium font-inter">
              {item.count.toLocaleString()} {itemLabel}
            </span>
          </div>
        ))}

        {logic.viewLevel < 3 && data.length > 2 ? (
          <button
            onClick={logic.handleSeeMore}
            className="text-sm text-orange-400 hover:text-orange-600 underline mt-1 w-fit font-medium font-inter transition-all"
          >
            {logic.viewLevel === 1 ? 'Ver más >' : 'Mostrar todo >'}
          </button>
        ) : (
          data.length > 2 && (
            <button
              onClick={logic.handleSeeLess}
              className="text-sm text-orange-400 hover:text-orange-600 underline mt-1 w-fit ml-auto font-medium font-inter transition-all"
            >
              {'<'} Ver menos
            </button>
          )
        )}
      </div>
    </section>
  )
}

export default function FilterPanel() {
  const [rentalsData, setRentalsData] = useState<FilterItem[]>([])
  const [salesData, setSalesData] = useState<FilterItem[]>([])
  const [typesData, setTypesData] = useState<FilterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [globalSort, setGlobalSort] = useState<'asc' | 'desc'>('asc')
  const [sortType, setSortType] = useState<'name' | 'count'>('name')
  const [mobileTab, setMobileTab] = useState<'alquiler' | 'venta' | 'tipo'>('alquiler')

  const toggleGlobalSort = () => setGlobalSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))

  const fetchFilters = async () => {
    setLoading(true)
    setHasError(false)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      const response = await fetch(`${API_BASE_URL}/api/filters`)
      const result = await response.json()

      if (result.success) {
        setRentalsData(result.data.rentals)
        setSalesData(result.data.sales)
        setTypesData(result.data.categories)
      } else {
        setHasError(true)
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  const rentalsLogic = useFilterLogic(rentalsData, globalSort, sortType)
  const salesLogic = useFilterLogic(salesData, globalSort, sortType)
  const typesLogic = useFilterLogic(typesData, globalSort, sortType)

  if (loading) {
    return (
      <div className="w-full lg:w-80 bg-white p-8 rounded-3xl lg:rounded-2xl border border-gray-100 shadow-sm lg:shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 lg:sticky lg:top-20 shrink-0 flex items-center justify-center">
        <span className="text-gray-500 italic font-inter font-medium text-sm animate-pulse">
          Sincronizando filtros...
        </span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="w-full lg:w-80 bg-white p-8 rounded-3xl lg:rounded-2xl border border-gray-100 shadow-sm lg:shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 lg:sticky lg:top-20 shrink-0 flex flex-col items-center justify-center text-center gap-4">
        <div className="bg-orange-50 p-4 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-500"
          >
            <path d="m2 2 20 20" />
            <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
          </svg>
        </div>
        <div>
          <h3 className="text-gray-900 font-bold font-inter text-base mb-1">Error de conexión</h3>
          <p className="text-gray-500 text-sm font-inter mb-4">
            No pudimos cargar los filtros en este momento.
          </p>
          <button
            onClick={fetchFilters}
            className="px-5 py-2.5 bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 transition-all rounded-xl text-sm font-bold font-inter outline-none active:scale-95"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const FilterHeader = () => (
    <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
      <div className="flex items-center gap-2 text-gray-900">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-500"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <h2 className="text-lg font-bold font-inter tracking-tight">Filtros</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setSortType('name')
            toggleGlobalSort()
          }}
          className={`text-sm font-medium transition-all font-inter outline-none ${sortType === 'name' ? 'text-orange-500 hover:text-orange-600' : 'text-gray-400 hover:text-gray-500'}`}
        >
          {sortType === 'name' && globalSort === 'desc' ? 'Ordenar A↓' : 'Ordenar A↑'}
        </button>

        <button
          onClick={() => {
            setSortType('count')
            toggleGlobalSort()
          }}
          className={`text-sm font-medium transition-all font-inter outline-none flex items-center gap-0.5 ${sortType === 'count' ? 'text-orange-500 hover:text-orange-600' : 'text-gray-400 hover:text-gray-500'}`}
        >
          Cant.
          <span>{sortType === 'count' && globalSort === 'desc' ? '↓' : '↑'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* --- VISTA MÓVIL --- */}
      <div className="lg:hidden w-full mb-8">
        {/* Ahora la cabecera es igual a la de PC */}
        <div className="px-2">
          <FilterHeader />
        </div>

        {/* Píldoras de selección */}
        <div className="flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-hide">
          <button
            onClick={() => setMobileTab('alquiler')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold font-inter transition-all ${mobileTab === 'alquiler' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-500'}`}
          >
            Alquileres
          </button>
          <button
            onClick={() => setMobileTab('venta')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold font-inter transition-all ${mobileTab === 'venta' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-500'}`}
          >
            En Venta
          </button>
          <button
            onClick={() => setMobileTab('tipo')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold font-inter transition-all ${mobileTab === 'tipo' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-500'}`}
          >
            Inmuebles
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mx-2">
          {mobileTab === 'alquiler' && (
            <FilterSection
              title="En Alquiler"
              data={rentalsData}
              logic={rentalsLogic}
              itemLabel="casas"
            />
          )}
          {mobileTab === 'venta' && (
            <FilterSection title="En Venta" data={salesData} logic={salesLogic} itemLabel="casas" />
          )}
          {mobileTab === 'tipo' && (
            <FilterSection
              title="Por tipo de Inmueble"
              data={typesData}
              logic={typesLogic}
              itemLabel="prop."
            />
          )}
        </div>
      </div>

      {/* --- VISTA DESKTOP --- */}
      <aside className="hidden lg:block w-80 bg-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 h-fit sticky top-20 shrink-0">
        <FilterHeader />

        <div className="space-y-6">
          <FilterSection
            title="Alquileres"
            data={rentalsData}
            logic={rentalsLogic}
            itemLabel="casas"
          />
          <FilterSection title="En venta" data={salesData} logic={salesLogic} itemLabel="casas" />
          <FilterSection
            title="Por tipo de Inmueble"
            data={typesData}
            logic={typesLogic}
            itemLabel="prop."
          />
        </div>
      </aside>
    </>
  )
}
