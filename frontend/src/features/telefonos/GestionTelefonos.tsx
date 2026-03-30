"use client";

import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Smartphone } from 'lucide-react';

const countries = [
    { code: '+591', flag: '🇧🇴', name: 'Bolivia', length: 8 },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', length: 10 },
    { code: '+56', flag: '🇨🇱', name: 'Chile', length: 9 },
    { code: '+51', flag: '🇵🇪', name: 'Perú', length: 9 },
];

export default function GestionTelefonos() {
    const [telefonos, setTelefonos] = useState([{ id: Date.now(), numero: '', pais: countries[0] }]);

    const addTelefono = () => {
        if (telefonos.length < 3) {
            setTelefonos([...telefonos, { id: Date.now(), numero: '', pais: countries[0] }]);
        }
    };

    const removeTelefono = (id: number) => {
        if (telefonos.length > 1) {
            setTelefonos(telefonos.filter(t => t.id !== id));
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {telefonos.map((tel, index) => (
                <div key={tel.id} className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <label className="w-40 font-medium text-gray-700 text-sm">
                        {index === 0 ? "Teléfono:" : `Teléfono ${index + 1}:`}
                    </label>

                    <div className="flex-1 flex bg-gray-200 rounded overflow-hidden items-center px-2 border border-transparent focus-within:border-gray-400 transition-all">
                        {/* Selector de País */}
                        <div className="relative flex items-center gap-1 mr-2 border-r border-gray-300 pr-2 py-2">
                            <span className="text-lg">{tel.pais.flag}</span>
                            <select
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                value={tel.pais.code}
                                onChange={(e) => {
                                    const p = countries.find(c => c.code === e.target.value);
                                    setTelefonos(telefonos.map(t => t.id === tel.id ? {...t, pais: p!} : t));
                                }}
                            >
                                {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                            </select>
                            <ChevronDown size={12} className="text-gray-500" />
                        </div>

                        <input
                            type="text"
                            className="bg-transparent flex-1 py-2 text-sm outline-none font-medium text-gray-800"
                            placeholder="70000000"
                            value={tel.numero}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setTelefonos(telefonos.map(t => t.id === tel.id ? {...t, numero: val} : t));
                            }}
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="w-10 flex justify-center">
                        {index === 0 && telefonos.length < 3 ? (
                            <button
                                onClick={addTelefono}
                                className="text-gray-600 hover:text-black hover:scale-110 transition-all p-1"
                                title="Agregar teléfono"
                            >
                                <Plus size={20} strokeWidth={3}/>
                            </button>
                        ) : index > 0 ? (
                            <button
                                onClick={() => removeTelefono(tel.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}