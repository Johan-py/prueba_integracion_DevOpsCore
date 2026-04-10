"use client";

import { useEffect, useState } from "react";
import { Home, Search as SearchIcon, DollarSign, Users, Maximize, SlidersHorizontal, ChevronDown } from "lucide-react";
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

type LocationValue =
  | string
  | {
      nombre?: string;
      target?: {
        value?: string;
      };
    };

// Botón Mock
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
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(["VENTA"]);
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
    const tipoMap: Record<string, string> = {
      Casa: "CASA",
      Departamento: "DEPARTAMENTO",
      Terreno: "TERRENO",
      Cuarto: "CUARTO",
      Espacios: "ESPACIOS",
      Cementerio: "CEMENTERIO",
    };

    const tipoFinal = tipoMap[tipoInmueble] || (tipoInmueble !== "Cualquier tipo" ? tipoInmueble.toUpperCase() : null);

    const nuevosFiltros = {
      tipoInmueble: tipoFinal ? [tipoFinal] : [],
      modoInmueble: modosSeleccionados,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString(),
    };

    updateFilters(nuevosFiltros);

    const params = new URLSearchParams();
    try {
      const merged = JSON.parse(
        sessionStorage.getItem("propbol_global_filters") || "{}",
      ) as { locationId?: string | number };
      if (merged.locationId != null && merged.locationId !== "") {
        params.set("locationId", String(merged.locationId));
      }
    } catch {
      /* ignore */
    }

    modosSeleccionados.forEach((modo) => params.append("modoInmueble", modo));
    if (tipoFinal) params.set("tipoInmueble", tipoFinal);
    if (ubicacionTexto.trim() !== "") params.set("query", ubicacionTexto.trim());

    const queryString = params.toString();
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ""}`;

    router.push(targetUrl);
    if (onSearch) onSearch(nuevosFiltros);
  };

  // 🚀 FIX Z-INDEX MASIVO: Agregamos z-[99999] y !overflow-visible para aplastar al mapa
  const containerStyles =
    variant === "map"
      ? "bg-[#faf9f6] border-b border-stone-200 py-5 px-6 w-full flex flex-col gap-5 shadow-sm sticky top-0 z-50 !overflow-visible"
      : "bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px] relative z-[99999] !overflow-visible";

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      
      {/* =========================================
          FILA SUPERIOR: Checkboxes (Protegidos con z-index)
          ========================================= */}
      <div className={`flex w-full relative z-[100] !overflow-visible ${variant === "map" ? "justify-start md:justify-center pl-2" : ""}`}>
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      {/* =========================================
          FILA INFERIOR: Todo lo demás
          ========================================= */}
      <div 
        className={`flex items-center w-full gap-3 relative z-[90] !overflow-visible ${
          variant === "map" 
            ? "flex-nowrap" 
            : "flex-col md:flex-row flex-wrap"
        }`}
      >
        {/* 🔸 Tipo (Aislado con z-[100] para que salte por encima de todo) */}
        <div className={`relative z-[100] !overflow-visible ${variant === "map" ? "w-48 shrink-0" : "w-full md:w-64"}`}>
          <ComboBox
            label={variant === "map" ? "" : "Tipo"}
            placeholder="Cualquier tipo"
            icon={Home}
            options={["Casa", "Departamento", "Terreno", "Cuarto", "Espacios", "Cementerio"]}
            onChange={(val: string) => setTipoInmueble(val)}
            value={tipoInmueble}
          />
        </div>

        {/* 🔸 Ubicación (Z-[90] para no tapar a Tipo, pero estar encima de lo demás) */}
        <div className={`relative z-[90] !overflow-visible ${variant === "map" ? "w-[300px] shrink-0" : "w-full flex-1"}`}>
          <LocationSearch
            value={ubicacionTexto}
            onChange={(val: LocationValue) => {
              const text = typeof val === "string" ? val : val?.nombre || val?.target?.value || "";
              setUbicacionTexto(text);
            }}
          />
        </div>

        {/* 🚀 FIX AISLAMIENTO DE SCROLL: 
            Solo estos botones tienen overflow-x-auto. Así los menús de la izquierda no se cortan. */}
        {variant === "map" && (
          <div className="flex items-center gap-3 flex-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="shrink-0"><MockFilterBtn icon={DollarSign} text="Precio" /></div>
            <div className="shrink-0"><MockFilterBtn icon={Users} text="Capacidad" /></div>
            <div className="shrink-0"><MockFilterBtn icon={Maximize} text="Metros" /></div>
            <div className="shrink-0"><MockFilterBtn icon={SlidersHorizontal} text="Más Filtros" hasChevron={false} /></div>
          </div>
        )}

        {/* 🔸 Botón Buscar */}
        <div className={variant === "map" ? "shrink-0 ml-auto relative z-10" : "w-full md:w-auto flex justify-end relative z-10"}>
          <button
            type="submit"
            className={`${
              variant === "map" ? "h-[46px] px-8 shadow-md" : "w-full md:w-auto h-[46px] px-10"
            } bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95`}
          >
            <SearchIcon size={18} />
            {variant === "home" && "BUSCAR"}
          </button>
        </div>
      </div>
      
    </form>
  )
}