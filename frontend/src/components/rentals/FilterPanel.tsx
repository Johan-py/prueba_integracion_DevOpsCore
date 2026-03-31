"use client";
import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { useFilterLogic } from '@/hooks/useFilterLogic'

interface FilterItem {
  name: string;
  count: number;
}

// Función para normalizar el texto (Cochabamba, Santa cruz -> Cochabamba, Santa cruz)
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
      <h3 className="text-lg font-bold text-black mb-3 underline underline-offset-4 inline-block font-inter tracking-tight">
        {title}
      </h3>
      <div
        className={`flex flex-col gap-3 mt-2 ${logic.viewLevel > 2 ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
      >
        {logic.visibleData.map((item: FilterItem) => (
          <div key={item.name} className="flex justify-between items-center gap-3">
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-medium font-inter transition-all">
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
            className="text-sm text-orange-400 hover:text-orange-500 underline mt-1 w-fit font-bold font-inter"
          >
            {logic.viewLevel === 1 ? 'Ver más >' : 'Mostrar todo >'}
          </button>
        ) : (
          data.length > 2 && (
            <button
              onClick={logic.handleSeeLess}
              className="text-sm text-orange-400 hover:text-orange-500 underline mt-1 w-fit ml-auto font-bold font-inter"
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

  // Estado de orden GLOBAL
  const [globalSort, setGlobalSort] = useState<'asc' | 'desc'>('asc')

  const toggleGlobalSort = () => {
    setGlobalSort((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const rentalsLogic = useFilterLogic(rentalsData, globalSort)
  const salesLogic = useFilterLogic(salesData, globalSort)
  const typesLogic = useFilterLogic(typesData, globalSort)

  if (loading) {
    return (
      <aside className="w-full lg:w-80 shrink-0 p-8 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 text-gray-500 font-medium italic font-inter h-fit lg:sticky lg:top-20">
        Sincronizando...
      </aside>
    )
  }

  return (
    <aside className="w-full lg:w-80 bg-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 h-fit lg:sticky lg:top-20 shrink-0">
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold font-inter tracking-tight">
            Filtros
          </h2>
        </div>
        <button
          onClick={toggleGlobalSort}
          className="text-sm font-medium text-orange-400 hover:text-orange-600 outline-none transition-all font-inter"
        >
          {globalSort === "asc" ? "Ordenar A↑" : "Ordenar A↓"}
        </button>
      </div>

      <div className="space-y-10">
        <FilterSection title="Alquileres" data={rentalsData} logic={rentalsLogic} itemLabel="casas" />
        <FilterSection title="En venta" data={salesData} logic={salesLogic} itemLabel="casas" />
        <FilterSection title="Inmuebles" data={typesData} logic={typesLogic} itemLabel="prop." />
      </div>
    </aside>
  );
}
