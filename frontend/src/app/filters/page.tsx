"use client";
import FilterBar from "@/components/filters/FilterBar";

// Definimos exactamente lo que el FilterBar envía para que TS no llore
interface FiltrosInput {
  tipoInmueble: string[];
  modoInmueble: string[];
  query: string;
  updatedAt?: string;
}
export default function FiltersPage() {
  // Usamos la interfaz aquí para que coincida perfectamente con el componente
  const handleSearch = (filtros: FiltrosInput) => {
    const params = new URLSearchParams();

    // Mapeo de los nuevos nombres a los parámetros de tu API
    filtros.tipoInmueble?.forEach((t) => params.append("categoria", t));
    filtros.modoInmueble?.forEach((m) => params.append("tipoAccion", m));
    if (filtros.query) params.append("query", filtros.query);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Usamos una función interna para el async y que no choque con el tipo 'void'
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/properties/search?${params.toString()}`,
        );
        const data = await response.json();
        console.log("Resultados:", data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  };

  return (
    <div className="flex flex-col items-center pt-32 px-4">
      {/* Ahora handleSearch coincide EXACTAMENTE con lo que FilterBar pide */}
      <FilterBar onSearch={handleSearch} />
    </div>
  );
}
