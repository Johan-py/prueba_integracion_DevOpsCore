"use client";

import { useRouter } from "next/navigation";
import { Home, Building, Bed, Trees, Flower2 } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  casas: <Home className="w-8 h-8" strokeWidth={1.5} />,
  departamentos: <Building className="w-8 h-8" strokeWidth={1.5} />,
  cuartos: <Bed className="w-8 h-8" strokeWidth={1.5} />,
  terrenos: <Trees className="w-8 h-8" strokeWidth={1.5} />,
  espacioscementerios: <Flower2 className="w-8 h-8" strokeWidth={1.5} />,
};

interface TypeItem {
  key: string;
  label: string;
  count: number;
}

interface PropertyTypeGridProps {
  items: TypeItem[];
}

export default function PropertyTypeGrid({ items }: PropertyTypeGridProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">
        Por tipo de inmueble
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mt-4">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              const tipoMap: Record<string, string> = {
                casas: "CASA",
                departamentos: "DEPARTAMENTO",
                cuartos: "CUARTO",
                terrenos: "TERRENO",
                espacioscementerios: "TERRENO_MORTUORIO",
              };
              const tipo = tipoMap[item.key] ?? item.key.toUpperCase();

              const modos = ["VENTA", "ALQUILER", "ANTICRETO"];

              const params = new URLSearchParams();
              params.set("tipoInmueble", tipo);
              modos.forEach(m => params.append("modoInmueble", m));

              const currentFilters = JSON.parse(sessionStorage.getItem('propbol_global_filters') || '{}');
              sessionStorage.setItem('propbol_global_filters', JSON.stringify({
                ...currentFilters,
                tipoInmueble: [tipo],
                modoInmueble: modos,
                query: "",
                updatedAt: new Date().toISOString()
              }));

              router.push(`/busqueda_mapa?${params.toString()}`);
            }}
            className="flex flex-col items-center w-full cursor-pointer transition-all duration-300 group hover:scale-105"
          >
            {/* Contenedor del Icono con diseño mejorado */}
            <div className="bg-white rounded-[24px] shadow-sm flex items-center justify-center p-6 mb-3 w-full border border-gray-100 group-hover:shadow-md group-hover:border-orange-300 transition-all duration-300">
              <div className="text-[#965a1e] transform group-hover:scale-110 transition-transform duration-300">
                {icons[item.key] ?? icons.casas}
              </div>
            </div>

            {/* Etiquetas de texto centradas */}
            <span className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-0.5 text-center">
              {item.label}
            </span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide text-center">
              {item.count.toLocaleString()} disponibles
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}