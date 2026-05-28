"use client";

import { Maximize, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SuperficieFilterProps {
  onCambio?: (min: string, max: string) => void;
}

export default function SuperficieFilter({ onCambio }: SuperficieFilterProps) {
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

  useEffect(() => {
    if (abierto && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelWidth = 200;
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
    if (!/^\d+$/.test(valor)) return "Solo se permiten números enteros";
    if (valor.length > MAX_DIGITOS) return `Máximo ${MAX_DIGITOS} dígitos`;
    if (Number(valor) < 0) return "No se permiten negativos";
    return "";
  };

  // ── Validación de rango lógico ──
  const validarRango = (min: string, max: string) => {
    if (min !== "" && max !== "" && Number(min) >= Number(max)) {
      setErrorRango("El valor 'Desde' debe ser menor que 'Hasta'");
    } else {
      setErrorRango("");
    }
  };

  // ── Bloquear teclas inválidas en tiempo real ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const teclasBloqueadas = ["-", "+", "e", "E", ".", ","];
    if (teclasBloqueadas.includes(e.key)) {
      e.preventDefault();
    }
  };

  // ── Bloquear pegado inválido ──
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    campo: "desde" | "hasta"
  ) => {
    const texto = e.clipboardData.getData("text");
    if (!/^\d+$/.test(texto) || texto.length > MAX_DIGITOS) {
      e.preventDefault();
      if (campo === "desde") setErrorDesde("Valor pegado inválido");
      if (campo === "hasta") setErrorHasta("Valor pegado inválido");
    }
  };

  // ── Cambio en Desde ──
  const handleDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // solo dígitos
    const cortado = val.slice(0, MAX_DIGITOS);          // máx 7 dígitos
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
        className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border
          ${tieneValores
            ? "bg-amber-600 text-white border-amber-600"
            : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
          }`}
      >
        <Maximize className={`w-4 h-4 ${tieneValores ? "text-white" : "text-stone-500"}`} />
        <span>Metros</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""} ${tieneValores ? "text-white" : "text-stone-400"}`} />
      </button>

      {/* ── Panel ── */}
      {abierto && (
        <div
          ref={panelRef}
          style={{ top: panelPos.top, left: panelPos.left }}
          className="fixed z-[9999] bg-white border-2 border-amber-500 rounded-2xl shadow-xl p-4 w-[200px]"
        >
          <p className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-0.5">
            Filtrar por Superficie
          </p>
          <p className="text-xs text-stone-400 mb-3">
            Ingrese el MIN Y MAX:
          </p>

          {/* Campo Desde */}
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs text-stone-600 w-10 shrink-0">Desde:</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="50"
              value={desde}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, "desde")}
              onChange={handleDesde}
              className={`w-full border rounded-lg px-2 py-1 text-sm text-stone-700 focus:outline-none focus:ring-1
                ${errorDesde
                  ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                  : "border-stone-300 focus:border-amber-500 focus:ring-amber-400"
                }`}
            />
          </div>
          {errorDesde && (
            <p className="text-xs text-red-500 mb-1 ml-12">{errorDesde}</p>
          )}

          {/* Campo Hasta */}
          <div className="flex items-center gap-2 mb-1 mt-2">
            <label className="text-xs text-stone-600 w-10 shrink-0">Hasta:</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="200"
              value={hasta}
              onKeyDown={handleKeyDown}
              onPaste={(e) => handlePaste(e, "hasta")}
              onChange={handleHasta}
              className={`w-full border rounded-lg px-2 py-1 text-sm text-stone-700 focus:outline-none focus:ring-1
                ${errorHasta
                  ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                  : "border-stone-300 focus:border-amber-500 focus:ring-amber-400"
                }`}
            />
          </div>
          {errorHasta && (
            <p className="text-xs text-red-500 mb-1 ml-12">{errorHasta}</p>
          )}

          {/* Error de rango */}
          {errorRango && (
            <p className="text-xs text-red-500 mt-1 mb-2 text-center">{errorRango}</p>
          )}

          {/* Aplicar */}
          <button
            type="button"
            disabled={hayErrores}
            onClick={() => { onCambio?.(desde, hasta); setAbierto(false); }}
            className={`w-full text-sm font-bold py-1.5 rounded-xl transition-all active:scale-95 mt-3
              ${hayErrores
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
          >
            Aplicar
          </button>

          {/* Limpiar */}
          {tieneValores && (
            <button
              type="button"
              onClick={() => {
                setDesde(""); setHasta("");
                setErrorDesde(""); setErrorHasta(""); setErrorRango("");
                onCambio?.("", "");
              }}
              className="mt-2 w-full text-xs text-stone-400 hover:text-amber-600 transition-colors"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
}