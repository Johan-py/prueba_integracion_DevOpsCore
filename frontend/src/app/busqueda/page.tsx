"use client";

import { Suspense } from "react";
import { ResultadosBusqueda } from "../../components/busqueda/ResultadosBusqueda";

// Componente intermedio para asegurar el aislamiento de los params
function BusquedaContent() {
  return (
    <div className="flex min-h-screen">
      <div className="w-[310px] min-h-[651px] bg-white p-4 overflow-y-auto flex-shrink-0">
        <ResultadosBusqueda />
      </div>
      <div className="flex-1 bg-gray-100">
        {/* Aquí puedes poner un placeholder del mapa si quieres */}
      </div>
    </div>
  );
}
export default function BusquedaPage() {
  return (
    // El Suspense debe ser lo único que devuelva el export default
    <Suspense
      fallback={<div className="p-10 text-center">Cargando buscador...</div>}
    >
      <BusquedaContent />
    </Suspense>
  );
}
