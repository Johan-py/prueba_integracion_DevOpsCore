"use client";

import { useEffect, useState } from "react";
import { Home, Search as SearchIcon, DollarSign, Users, Maximize, SlidersHorizontal, ChevronDown} from "lucide-react";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { LocationSearch } from "../layout/LocationSearch";
import { ComboBox } from "../ui/ComboBox";
import TransactionModeFilter from "./TransactionModeFilter";
import { useRouter } from "next/navigation";

interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[];
    modoInmueble: string[];
    query: string;
    updatedAt: string;
  }) => void;
  variant?: "home" | "map";
}

// ✅ Tipo seguro (sin any)
type LocationValue =
  | string
  | {
    nombre?: string;
    target?: {
      value?: string;
    };
  };

  // Componente visual para los botones que aún no tienen funcionalidad
const MockFilterBtn = ({ icon: Icon, text, hasChevron = true }: { icon?: any, text: string, hasChevron?: boolean }) => (
  <button
    type="button"
    className="h-[46px] flex items-center justify-between bg-white border border-stone-200 text-stone-600 px-4 rounded-xl shadow-sm hover:border-stone-300 transition-all font-inter text-sm whitespace-nowrap gap-3 shrink-0 focus:outline-none cursor-default"
    onClick={(e) => e.preventDefault()}
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-stone-500" />}
      <span>{text}</span>
    </div>
    {hasChevron && <ChevronDown className="w-4 h-4 text-stone-400" />}
  </button>
);

export default function FilterBar({
  onSearch,
  variant = "home",
}: FilterBarProps) {
  const router = useRouter();

  const { updateFilters } = useSearchFilters();
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>([
    "VENTA",
  ]);
  const [tipoInmueble, setTipoInmueble] = useState<string>("Cualquier tipo");
  const [ubicacionTexto, setUbicacionTexto] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("propbol_global_filters");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tipoInmueble)
        setTipoInmueble(parsed.tipoInmueble[0] || "Cualquier tipo");

      if (parsed.modoInmueble) {
        setModosSeleccionados(
          Array.isArray(parsed.modoInmueble)
            ? parsed.modoInmueble
            : [parsed.modoInmueble]
        );
      }

      if (parsed.query) setUbicacionTexto(parsed.query);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Mapeo para el backend
    const tipoMap: Record<string, string> = {
      Casa: "CASA",
      Departamento: "DEPARTAMENTO",
      Terreno: "TERRENO",
      Cuarto: "CUARTO",
      Espacios: "ESPACIOS",
      Cementerio: "CEMENTERIO",
    };

    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== "Cualquier tipo"
        ? tipoInmueble.toUpperCase()
        : null);

    const nuevosFiltros = {
      tipoInmueble:
        tipoInmueble !== "Cualquier tipo"
          ? [tipoInmueble.toUpperCase()]
          : [],
      modoInmueble: modosSeleccionados,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString(),
    };

    updateFilters(nuevosFiltros);

    const params = new URLSearchParams();
    modosSeleccionados.forEach((modo) =>
      params.append("modoInmueble", modo)
    );

    if (tipoFinal) params.set("tipoInmueble", tipoFinal);

    if (ubicacionTexto.trim() !== "")
      params.set("query", ubicacionTexto.trim());

    const queryString = params.toString();
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ""}`;

    router.push(targetUrl);

    if (onSearch) onSearch(nuevosFiltros);
  };

  // ✅ CONTENEDOR RESPONSIVE
  const containerStyles =
    variant === "map"
      ? "bg-white border-b border-stone-200 p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full shadow-sm"
      : "bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px]";

  return (
    <form className={containerStyles}>
      {/* 🔹 Modo venta/alquiler */}
      <div className="w-full md:w-auto">
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      {/* 🔹 CONTENIDO PRINCIPAL */}
      <div className="flex flex-col md:flex-row w-full gap-3">
        {/* 🔸 Tipo */}
        <div className="w-full md:w-48">
          <ComboBox
            label={variant === "map" ? "" : "Tipo"}
            placeholder="Cualquier tipo"
            icon={Home}
            options={[
              "Casa",
              "Departamento",
              "Terreno",
              "Cuarto",
              "Espacios",
              "Cementerio",
            ]}
            onChange={(val: string) => setTipoInmueble(val)}
          />
        </div>

        {/* 🔸 Ubicación */}
        <div className="w-full flex-1">
          <LocationSearch
            value={ubicacionTexto}
            onChange={(val: LocationValue) => {
              const text =
                typeof val === "string"
                  ? val
                  : val?.nombre || val?.target?.value || "";
              setUbicacionTexto(text);
            }}
          />
        </div>

        {/* 🔸 NUEVOS BOTONES ACORDE AL MOCKUP (Solo visibles en el mapa) */}
        {variant === "map" && (
          <>
            <MockFilterBtn icon={DollarSign} text="Precio" />
            <MockFilterBtn icon={Users} text="Capacidad" />
            <MockFilterBtn icon={Maximize} text="Metros" />
            <MockFilterBtn icon={SlidersHorizontal} text="Más Filtros" hasChevron={false} />
          </>
        )}

        {/* 🔸 Botón */}
        <div className="w-full md:w-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="w-full md:w-auto h-[46px] px-6 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <SearchIcon size={18} />
            {variant === "map" ? "" : "BUSCAR"}
          </button>
        </div>
      </div>
    </form>
  );
}