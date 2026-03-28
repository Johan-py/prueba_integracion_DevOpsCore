"use client";
import { useState } from "react";

export default function PropertyTypeVisual() {
  const options = ["Casa", "Departamento", "Terreno", "Habitación", "Local"];
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  return (
    <div className="relative w-56">
      {/* Label */}
      <label className=" text-stone-900 font-medium text-sm block text-center mb-1">Tipos de Inmueble</label>

      {/* Input visual */}
      <div
        onClick={() => setOpen(!open)}
        className=" flex items-center justify-between border rounded-md px-3 py-2 bg-white cursor-pointer "
        style={{  border: '1px solid #8C8787'}}
      >
        <span className="text-sm text-stone-500">
          {selected.length === 0 ? "Casa" : selected.join(", ")}
        </span>
        <span className="text-stone-500 text-sm">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-1 w-full bg-white border rounded-md shadow-md p-2 flex flex-col gap-3">
          {options.map(option => {
            const isSelected = selected.includes(option);
            return (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`
                  cursor-pointer px-3 py-1.5 rounded-md text-sm text-stone-500
                  ${isSelected ? "bg-[#d97706] font-medium text-white" : "hover:bg-stone-100"}
               `}
              >
                {option}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}