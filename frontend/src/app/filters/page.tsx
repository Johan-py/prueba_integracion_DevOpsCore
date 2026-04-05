'use client'
import FilterBar from '@/components/filters/FilterBar'

// Definimos exactamente lo que el FilterBar envía para que TS no llore
interface FiltrosInput {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  updatedAt?: string
}
export default function FiltersPage() {
<<<<<<< HEAD
  const handleSearch = async (filtros: { tipos: string[]; modo: string[] }) => {
    const params = new URLSearchParams()
    filtros.tipos.forEach((tipo) => params.append('categoria', tipo))
    filtros.modo.forEach((modo) => params.append('tipoAccion', modo))

    const response = await fetch(`http://localhost:5000/api/properties/search?${params.toString()}`)

    const data = await response.json()
    console.log('JSON:', data)
=======
  // Usamos la interfaz aquí para que coincida perfectamente con el componente
  const handleSearch = (filtros: FiltrosInput) => {
    const params = new URLSearchParams()
    
    // Mapeo de los nuevos nombres a los parámetros de tu API
    filtros.tipoInmueble?.forEach((t) => params.append('categoria', t))
    filtros.modoInmueble?.forEach((m) => params.append('tipoAccion', m))
    if (filtros.query) params.append('query', filtros.query)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    // Usamos una función interna para el async y que no choque con el tipo 'void'
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/properties/search?${params.toString()}`)
        const data = await response.json()
        console.log('Resultados:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    
    fetchData()
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
  }

  return (
    <div className="flex flex-col items-center pt-32 px-4">
      {/* Ahora handleSearch coincide EXACTAMENTE con lo que FilterBar pide */}
      <FilterBar onSearch={handleSearch} />
    </div>
  )
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
}
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
=======
}
>>>>>>> 453ab1a520127979d6fa94229b1b3a7e940c3a22
