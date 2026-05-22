"use client";

import { useMemo } from "react";
// Íconos de navegación para paginación
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export type MapaListadoPaginacionProps = {
  total: number;
  page: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
  /** Con 0 resultados: texto breve (p. ej. error de API) */
  hint?: string | null;
};

export default function MapaListadoPaginacion({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hint,
}: MapaListadoPaginacionProps) {
  // Calcula el total de páginas
  // Siempre mínimo 1 para evitar divisiones inválidas y mostrar controles de paginación aunque no haya resultados
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const disabled = total === 0;
  const showPaginationControls = !disabled && totalPages > 1;

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (safePage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (safePage >= totalPages - 3)
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  }, [safePage, totalPages]);

  const from = disabled ? 0 : (safePage - 1) * pageSize + 1;
  const to = disabled ? 0 : Math.min(safePage * pageSize, total);

  return (
    <div className="shrink-0 border-t border-stone-100 bg-stone-50 px-3 py-2 flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <label className="flex items-center gap-2 text-xs text-stone-600">
          <span className="whitespace-nowrap">Por página</span>
          <select
            className="border border-stone-200 rounded-md px-2 py-1 text-xs bg-white disabled:opacity-50"

            value={pageSize}
            disabled={disabled}
            onChange={(e) => {
              const v = Number(e.target.value);
              if ((PAGE_SIZE_OPTIONS as readonly number[]).includes(v)) {
                onPageSizeChange(v as PageSize);
              }
            }}
          >
            {/* Render dinámico de opciones */}
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}

          </select>
        </label>
        {showPaginationControls ? (
          // Botones de navegación de página
          <div className="flex items-center gap-1 shrink-0" aria-label="Paginación">
            {safePage > 1 ? (
              <button
                type="button"
                onClick={() => onPageChange(safePage - 1)}
                className="p-1.5 rounded-md border border-stone-200 bg-white"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null}
            <div className="flex items-center gap-1 justify-center no-scrollbar">
              {visiblePages.map((n, idx) => (
                n === "..." ? (
                  <span key={`dots-${idx}`} className="px-1 text-stone-400 text-xs">...</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onPageChange(n as number)}
                    className={`min-w-[1.75rem] h-7 text-xs rounded-md border transition-colors ${
                      n === safePage
                        ? "bg-orange-500 text-white border-orange-500 font-semibold shadow-sm"
                        : "bg-white border-stone-200 text-stone-600 hover:border-orange-300"
                    }`}
                  >
                    {n}
                  </button>
                )
              ))}
            </div>
            {safePage < totalPages ? (
              <button
                type="button"
                onClick={() => onPageChange(safePage + 1)}
                className="p-1.5 rounded-md border border-stone-200 bg-white"
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="text-[11px] text-stone-500 text-center">
        {disabled
          ? "Sin inmuebles en esta búsqueda — la paginación se activará al haber resultados."
          : `Mostrando ${from}–${to} de ${total}`}
      </p>

      {!disabled && totalPages > 1 && safePage >= totalPages && (
        <p className="text-[11px] text-stone-400 text-center">No hay más resultados para mostrar.</p>
      )}
      
      {disabled && hint ? (
        <p className="text-[11px] text-red-600/90 text-center break-words">{hint}</p>
) : null}
    </div>
  );
}
