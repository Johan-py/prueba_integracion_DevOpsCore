"use client"

import { useEffect, useState } from "react"
import { Home, Search as SearchIcon } from "lucide-react"
import { useSearchFilters } from "@/hooks/useSearchFilters"
import { LocationSearch } from "../layout/LocationSearch" // Componente de Zona
import { ComboBox } from "../ui/ComboBox" // Componente estético
import TransactionModeFilter from "./TransactionModeFilter"

interface FilterBarProps {
  onSearch?: (filtros: { tipos: string[]; modo: string[] }) => void
}

export default function FilterBar({ onSearch }: FilterBarProps) {
  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(["VENTA"])
  const [tipoInmueble, setTipoInmueble] = useState<string>("Cualquier tipo")
  const [ubicacionTexto, setUbicacionTexto] = useState("")
// Sincronizar con filtros previos si existen en la sesión
  useEffect(() => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.tipoInmueble) setTipoInmueble(parsed.tipoInmueble[0] || "Cualquier tipo")
      if (parsed.modoInmueble) {
      setModosSeleccionados(Array.isArray(parsed.modoInmueble) 
        ? parsed.modoInmueble 
        : [parsed.modoInmueble])
    }
      if (parsed.query) setUbicacionTexto(parsed.query)
    }
  }, [])

  const handleSearch = () => {
    if (modosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un modo (Venta, Alquiler o Anticrético)")
      return
    }

    updateFilters({
      tipoInmueble: [tipoInmueble.toUpperCase()],
      modoInmueble: modosSeleccionados, // Enviamos el primero para compatibilidad
      query: ubicacionTexto,
      updatedAt: new Date().toISOString()
    })

    window.location.href = "/busqueda_mapa";
  }
  return (
    <div className="bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px]">
      <TransactionModeFilter
        modoSeleccionado={modosSeleccionados}
        onModoChange={setModosSeleccionados}
      />
      <div className="flex flex-col md:flex-row items-end gap-4">
        
        <div className="w-full md:w-1/4">
          <ComboBox 
            label="Tipo de Inmueble" 
            placeholder="Cualquier tipo"
            icon={Home}
            options={["Casa", "Departamento", "Terreno", "Espacios Cementerio"]}
            onChange={(val) => setTipoInmueble(val)}
          />
        </div>

        {/* Buscador de Ciudad */}
        <div className="flex-1 w-full">
          <LocationSearch 
            value={ubicacionTexto} 
            onChange={setUbicacionTexto} 
          />
        </div>

        {/* Botón de Búsqueda Estético */}
        <button 
          onClick={handleSearch}
          className="h-[46px] px-10 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <SearchIcon size={18} /> BUSCAR
        </button>
      </div>
    </div>
  )
}