"use client";

import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Pencil } from 'lucide-react';

const soloLetras = (value: string) => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

// --- TU LÓGICA DE LA HU-04 ---
const countries = [
    { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
];

export default function ProfileCard() {
    // Estado para tus teléfonos (HU-04)
    const [telefonos, setTelefonos] = useState([{ id: Date.now(), numero: '', pais: countries[0] }]);

    const addTelefono = () => {
        if (telefonos.length < 3) setTelefonos([...telefonos, { id: Date.now(), numero: '', pais: countries[0] }]);
    };

    const removeTelefono = (id: number) => {
        if (telefonos.length > 1) setTelefonos(telefonos.filter(t => t.id !== id));
    };

    // Otros campos de la HU-02 (Identidad)
    const etiquetasRestantes = ["Nombre Completo", "E-mail", "País", "Género", "Dirección"];
    const [campoEditando, setCampoEditando] = useState<string | null>(null);

    return (
  <div className="bg-gray-100 p-6 md:p-8 rounded-xl flex flex-col md:flex-row gap-8 md:gap-10 items-center">

    {/* LADO IZQUIERDO (Identidad) */}
    <div className="flex flex-col items-center justify-center w-full md:w-1/3 text-center md:text-left">
      <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-500 text-xs uppercase">Imagen</span>
      </div>
      <p className="mt-4 font-semibold text-lg text-gray-800 uppercase tracking-tight">Perfil 1</p>
      <p className="text-sm text-gray-500 italic">perfil1@gmail.com</p>
    </div>

    {/* LADO DERECHO (Formulario Integrado) */}
    <div className="w-full md:w-2/3">
      <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2">
        Datos Personales
      </h2>

      <div className="flex flex-col gap-4">

        {/* CAMPOS DE LA HU-02 */}
        {etiquetasRestantes.map((label, index) => (
          
         <div
          key={index}
          className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full"
        >

  {/* LABEL */}
  <label className="w-full md:w-40 shrink-0 font-medium text-gray-700 text-sm">
    {label}:
  </label>

  {/* CONTENEDOR INPUT + ICONO */}
  <div className="flex w-full items-center gap-2">

    {/* INPUT */}
    <input
      type="text"
      disabled={campoEditando !== label}
      className={`flex-1 min-w-0 bg-gray-200 px-3 py-2 rounded outline-none text-sm transition-all
        ${
          campoEditando === label
            ? "bg-white ring-1 ring-black"
            : "opacity-70 cursor-not-allowed"
        }
      `}
      onChange={(e) => {
        if (
          label === "Nombre Completo" ||
          label === "País" ||
          label === "Género"
        ) {
          e.target.value = soloLetras(e.target.value);
        }
      }}
    />

    {/* BOTÓN EDITAR */}
    <button
      onClick={() => setCampoEditando(label)}
      className="text-gray-400 hover:text-black transition-colors"
    >
      <Pencil size={16} />
    </button>

  </div>

</div>
        ))}

        {/* --- TELÉFONOS --- */}
        {telefonos.map((tel, index) => (
          <div key={tel.id} className="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300">
            <label className="w-40 font-medium text-gray-700 text-sm">
              {index === 0 ? "Teléfono:" : `Teléfono ${index + 1}:`}
            </label>

            <div className="flex-1 flex bg-gray-200 rounded overflow-hidden items-center px-2">
              <div className="relative flex items-center gap-1 mr-2 border-r border-gray-300 pr-2">
                <span className="text-lg cursor-pointer">{tel.pais.flag}</span>
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={tel.pais.code}
                  onChange={(e) => {
                    const p = countries.find(c => c.code === e.target.value);
                    setTelefonos(telefonos.map(t => t.id === tel.id ? {...t, pais: p!} : t));
                  }}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="text-gray-500" />
              </div>

              <input
                type="text"
                className="bg-transparent flex-1 py-2 text-sm outline-none font-medium"
                placeholder="70000000"
                value={tel.numero}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTelefonos(telefonos.map(t => t.id === tel.id ? {...t, numero: val} : t));
                }}
              />
            </div>

            <div className="w-10 flex justify-center">
              {index === 0 && telefonos.length < 3 ? (
                <button onClick={addTelefono} className="text-gray-600 hover:text-black transition-colors">
                  <Plus size={20} strokeWidth={3}/>
                </button>
              ) : index > 0 ? (
                <button onClick={() => removeTelefono(tel.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              ) : <div className="w-5" />}
            </div>
          </div>
        ))}

      </div>

      {/* BOTÓN GUARDAR */}
      <div className="mt-8 flex justify-end">
        <button className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold hover:bg-black transition-all active:scale-95 shadow-md">
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
);
}
