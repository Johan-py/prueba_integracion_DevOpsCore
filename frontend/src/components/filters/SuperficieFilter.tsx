"use client";

import { Maximize, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

interface SuperficieFilterProps {
  onCambio?: (min: string, max: string) => void;
}

export default function SuperficieFilter({ onCambio }: SuperficieFilterProps) {
  const searchParams = useSearchParams();
  const [abierto, setAbierto] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [errorDesde, setErrorDesde] = useState("");
  const [errorHasta, setErrorHasta] = useState("");
  const [errorRango, setErrorRango] = useState("");
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const MAX_DIGITOS = 7;

  // Sincronizar con la URL
  useEffect(() => {
    const min = searchParams?.get('minSuperficie') || '';
    const max = searchParams?.get('maxSuperficie') || '';
    setDesde(min);
    setHasta(max);
  }, [searchParams]);

  useEffect(() => {
    if (abierto && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelWidth = 220;
      const leftPos = rect.left + panelWidth > window.innerWidth
        ? rect.right - panelWidth
        : rect.left;
      setPanelPos({ top: rect.bottom + 6, left: leftPos });
    }
  }, [abierto]);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // ── Validación de un campo individual ──
  const validarCampo = (valor: string): string => {
    if (valor === "") return "";
    if (!/^\d+$/.test(valor)) return "Solo enteros";
    if (valor.length > MAX_DIGITOS) return `Máx ${MAX_DIGITOS} dígitos`;
    if (Number(valor) < 0) return "No negativos";
    return "";
  };

  // ── Validación de rango lógico ──
  const validarRango = (min: string, max: string) => {
    if (min !== "" && max !== "" && Number(min) >= Number(max)) {
      setErrorRango("'Desde' debe ser menor que 'Hasta'");
    } else {
      setErrorRango("");
    }
  };

  // ── Manejo de eventos de teclado ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const teclasBloqueadas = ["-", "+", "e", "E", ".", ","];
    if (teclasBloqueadas.includes(e.key)) e.preventDefault();
  };

  // ── Manejo de eventos de pegar ──
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, campo: "desde" | "hasta") => {
    const texto = e.clipboardData.getData("text");
    if (!/^\d+$/.test(texto) || texto.length > MAX_DIGITOS) {
      e.preventDefault();
      if (campo === "desde") setErrorDesde("Inválido");
      if (campo === "hasta") setErrorHasta("Inválido");
    }
  };

  // ── Cambio en Desde ──
  const handleDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const cortado = val.slice(0, MAX_DIGITOS);
    setDesde(cortado);
    setErrorDesde(validarCampo(cortado));
    validarRango(cortado, hasta);
    onCambio?.(cortado, hasta);
  };

  // ── Cambio en Hasta ──
  const handleHasta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const cortado = val.slice(0, MAX_DIGITOS);
    setHasta(cortado);
    setErrorHasta(validarCampo(cortado));
    validarRango(desde, cortado);
    onCambio?.(desde, cortado);
  };

  const hayErrores = errorDesde !== "" || errorHasta !== "" || errorRango !== "";
  const tieneValores = desde !== "" || hasta !== "";

  return (
    <div className="relative shrink-0">

      {/* ── Botón ── */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${
          tieneValores || abierto
            ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]'
            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'
        }`}
      >
        <Maximize className={`w-4 h-4 ${tieneValores || abierto ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
        <span>Metros</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""} ${tieneValores || abierto ? "text-white" : "text-stone-400 dark:text-stone-400"}`} />
      </button>

      {/* ── Panel ── */}
      {abierto && (
        <div
          ref={panelRef}
          style={{ top: panelPos.top, left: panelPos.left }}
          className="fixed z-[9999] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 w-[220px]"
        >
          <p className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide mb-0.5">
            Superficie (m²)
          </p>
          <p className="text-xs text-stone-400 mb-3">
            Ingrese MIN y MAX:
          </p>

          {/* Campo Desde */}
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs text-stone-600 dark:text-stone-300 w-10 shrink-0">Desde:</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej: 50"
              value={desde}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, "desde")}
              onChange={handleDesde}
              className={`w-full border rounded-lg px-2 py-1.5 text-sm outline-none transition-all dark:bg-stone-800 dark:text-stone-200 ${
                errorDesde
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300'
                  : 'border-stone-300 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] dark:border-stone-700 dark:focus:border-[#E87C1E]'
              }`}
            />
          </div>
          {errorDesde && <p className="text-[10px] text-red-500 mb-1 ml-12">{errorDesde}</p>}

          {/* Campo Hasta */}
          <div className="flex items-center gap-2 mb-1 mt-2">
            <label className="text-xs text-stone-600 dark:text-stone-300 w-10 shrink-0">Hasta:</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej: 200"
              value={hasta}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, "hasta")}
              onChange={handleHasta}
              className={`w-full border rounded-lg px-2 py-1.5 text-sm outline-none transition-all dark:bg-stone-800 dark:text-stone-200 ${
                errorHasta
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300'
                  : 'border-stone-300 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] dark:border-stone-700 dark:focus:border-[#E87C1E]'
              }`}
            />
          </div>
          {errorHasta && <p className="text-[10px] text-red-500 mb-1 ml-12">{errorHasta}</p>}

          {errorRango && <p className="text-[10px] text-red-500 mt-2 mb-1 text-center font-medium">{errorRango}</p>}

          {/* Aplicar */}
          <button
            type="button"
            disabled={hayErrores}
            onClick={() => { onCambio?.(desde, hasta); setAbierto(false); }}
            className={`w-full text-sm font-bold py-2 rounded-xl transition-all active:scale-95 mt-3 ${
              hayErrores
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed dark:bg-stone-800 dark:text-stone-500'
                : 'bg-[#d97706] hover:bg-[#b95e00] text-white dark:bg-[#E87C1E]'
            }`}
          >
            Aplicar
          </button>

          {/* Limpiar filtro */}
          {tieneValores && (
            <button
              type="button"
              onClick={() => {
                setDesde(""); setHasta("");
                setErrorDesde(""); setErrorHasta(""); setErrorRango("");
                onCambio?.("", "");
              }}
              className="mt-2 w-full text-xs text-stone-400 hover:text-[#d97706] transition-colors underline dark:hover:text-[#E87C1E]"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
}