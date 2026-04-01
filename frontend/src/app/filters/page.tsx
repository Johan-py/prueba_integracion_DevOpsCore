"use client";
import FilterBar from "@/components/filters/FilterBar";

export default function FiltersPage() {

  const handleSearch = async (filtros: { tipos: string[]; modo: string[] }) => {

    const params = new URLSearchParams();
    filtros.tipos.forEach(tipo => params.append("categoria", tipo));
    filtros.modo.forEach(modo => params.append("tipoAccion", modo));

    const response = await fetch(
      `http://localhost:5000/api/properties/search?${params.toString()}`
    );

    const data = await response.json();
    console.log("JSON:", data);
  };

  return (
    <div className="flex flex-col items-center pt-32 px-4">
      <FilterBar onSearch={handleSearch} />
    </div>
  );
}