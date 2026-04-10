"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Search as SearchIcon,
  DollarSign,
  Users,
  Maximize,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
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

type IconType = React.ComponentType<{ className?: string }>;

const MockFilterBtn = ({
  icon: Icon,
  text,
  hasChevron = true,
}: {
  icon?: IconType;
  text: string;
  hasChevron?: boolean;
}) => (
  <button
    type="button"
    className="h-[46px] flex items-center justify-between bg-white border border-stone-200 text-stone-600 px-4 rounded-xl shadow-sm hover:border-stone-300 transition-all text-sm whitespace-nowrap gap-3 shrink-0"
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
  const [tipoInmueble, setTipoInmueble] =
    useState<string>("Cualquier tipo");
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
      "Espacios Cementerio": "ESPACIOS",
    };

    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== "Cualquier tipo"
        ? tipoInmueble.toUpperCase()
        : null);

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
        sessionStorage.getItem("propbol_global_filters") || "{}"
      ) as { locationId?: string | number };

      if (merged.locationId != null && merged.locationId !== "") {
        params.set("locationId", String(merged.locationId));
      }
    } catch { }

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

  const containerStyles =
    variant === "map"
      ? "bg-[#faf9f6] border-b border-stone-200 py-5 px-6 w-full flex flex-col gap-5 shadow-sm sticky top-0 z-50"
      : "bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px]";

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      <TransactionModeFilter
        modoSeleccionado={modosSeleccionados}
        onModoChange={setModosSeleccionados}
      />

      <div
        className={`flex items-center gap-3 w-full ${variant === "map"
          ? "flex-wrap"   // 🔥 FIX CLAVE
          : "flex-col md:flex-row flex-wrap"
          }`}
      >
        {/* ComboBox */}
        <div className="w-full md:w-64 relative z-[9999]">
          <ComboBox
            label={variant === "map" ? "" : "Tipo"}
            placeholder="Cualquier tipo"
            icon={Home}
            options={[
              "Casa",
              "Departamento",
              "Terreno",
              "Cuarto",
              "Espacios Cementerio",
            ]}
            value={tipoInmueble}
            onChange={(val: string) => setTipoInmueble(val)}
          />
        </div>

        {/* Ubicación */}
        <div className="w-full flex-1 relative z-[50]">
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

        {/* Filtros */}
        {variant === "map" && (
          <div className="flex items-center gap-3 flex-wrap">
            <MockFilterBtn icon={DollarSign} text="Precio" />
            <MockFilterBtn icon={Users} text="Capacidad" />
            <MockFilterBtn icon={Maximize} text="Metros" />
            <MockFilterBtn
              icon={SlidersHorizontal}
              text="Más Filtros"
              hasChevron={false}
            />
          </div>
        )}

        {/* Botón */}
        <button
          type="submit"
          className="h-[46px] px-8 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <SearchIcon size={18} />
          {variant === "home" && "BUSCAR"}
        </button>
      </div>
    </form>
  );
}