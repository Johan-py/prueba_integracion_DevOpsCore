'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavLinks() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkStyle =
    "hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition";

  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700 dark:text-gray-300">
      <div id="tour-propiedades" className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${
            open
              ? "text-[#E68B25] bg-[#E68B25]/10"
              : "hover:text-[#E68B25] hover:bg-[#E68B25]/10"
          }`}
        >
          Propiedades
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-56 rounded-md bg-white dark:bg-[#1a1a1a] shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white/10 z-50 py-2">
            {[
              "Casas",
              "Departamentos",
              "Cuartos",
              "Terrenos",
              "Espacios de cementerios",
            ].map((item) => (
              <button
                key={item}
                type="button"
                data-confirm-exit="true"
                onClick={() => {
                  setOpen(false);

                  const tipoMap: Record<string, string> = {
                    Casas: "CASA",
                    Departamentos: "DEPARTAMENTO",
                    Cuartos: "CUARTO",
                    Terrenos: "TERRENO",
                    "Espacios de cementerios": "TERRENO_MORTUORIO",
                  };

                  const tipoFinal = tipoMap[item];
                  const modosFinales = ["VENTA"];

                  const nuevosFiltros = {
                    tipoInmueble: [tipoFinal],
                    modoInmueble: modosFinales,
                    query: "",
                    updatedAt: new Date().toISOString(),
                  };

                  const currentFilters = JSON.parse(
                    sessionStorage.getItem("propbol_global_filters") || "{}"
                  );

                  sessionStorage.setItem(
                    "propbol_global_filters",
                    JSON.stringify({
                      ...currentFilters,
                      ...nuevosFiltros,
                    })
                  );

                  const params = new URLSearchParams();

                  modosFinales.forEach((modo) => {
                    params.append("modoInmueble", modo);
                  });

                  if (tipoFinal) {
                    params.set("tipoInmueble", tipoFinal);
                  }

                  router.push(`/busqueda_mapa?${params.toString()}`);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] hover:text-[#E68B25]"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <Link
        id="tour-blogs"
        href="/blogs"
        data-confirm-exit="true"
        className={linkStyle}
      >
        Blogs
      </Link>

      <Link
        id="tour-planes"
        href="/cobros-suscripciones"
        data-confirm-exit="true"
        className={linkStyle}
      >
        Planes de membresía
      </Link>

      <button
        id="tour-ayuda"
        type="button"
        data-confirm-exit="true"
        onClick={() => {
          router.push("/");

          setTimeout(() => {
            window.dispatchEvent(new Event("propbol:iniciar-tour"));
          }, 300);
        }}
        className={linkStyle}
        >
         Ayuda
      </button>
    </div>
  );
}