"use client";
import { useState } from "react";

interface PropertyTypeVisualProps {
  tiposSeleccionados: string[];
  onTipoChange: (tipo: string) => void;
}

export default function PropertyTypeVisual({ tiposSeleccionados, onTipoChange }: PropertyTypeVisualProps) {
  const options = ["CASA", "DEPARTAMENTO", "TERRENO", "HABITACION", "LOCAL"];
  const [open, setOpen] = useState(false)
  
  const getDisplayName = (option: string) => {
    const names: Record<string, string> = {
      "CASA": "Casa",
      "DEPARTAMENTO": "Departamento",
      "TERRENO": "Terreno",
      "HABITACION": "Habitación",
      "LOCAL": "Local"
    };
    return names[option] || option;
  };
  
  const toggleOption = (option: string) => {
    onTipoChange(option);
  };

  return (
    <div className=" relative w-56">
      <label className="text-stone-900 font-medium text-sm block text-center mb-1">
        Tipos de Inmueble
      </label>

      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border rounded-md px-3 py-2 bg-white cursor-pointer"
        style={{ border: '1px solid #8C8787' }}
      >
        <span className="text-sm text-stone-500">
          {tiposSeleccionados.length === 0 ? "Todos" : tiposSeleccionados.map(getDisplayName).join(", ")}
        </span>
        
        <span className="text-stone-500 text-sm flex items-center">
          <svg
            width="18"
            height="8"
            viewBox="0 0 18 8"
            fill="none"
            style={{
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <path
              d="M1 1L9 6L17 1"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          </svg>
        </span>
      </div>

      {open && (
        <div className="absolute mt-1 w-full bg-white border rounded-md shadow-md p-2 flex flex-col gap-3 z-10">
          {options.map(option => {
            const isSelected = tiposSeleccionados.includes(option);
            return (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`
                  cursor-pointer px-3 py-1.5 rounded-md text-sm
                  ${isSelected ? "bg-[#d97706] font-medium text-white" : "text-stone-500 hover:bg-stone-100"}
                `}
              >
                {getDisplayName(option)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}