'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Telefono {
    id: number;
    numero: string;
    pais: string;
    codigo: string;
}

const PAISES = [
    { nombre: 'Bolivia', codigo: '+591', flag: '🇧🇴' },
    { nombre: 'Argentina', codigo: '+54', flag: '🇦🇷' },
    { nombre: 'Chile', codigo: '+56', flag: '🇨🇱' },
    { nombre: 'Perú', codigo: '+51', flag: '🇵🇪' },
];

export default function GestionTelefonos() {
    // Estado local solo para el comportamiento visual del esqueleto
    const [telefonos, setTelefonos] = useState<Telefono[]>([
        { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
    ]);

    const agregarTelefono = () => {
        if (telefonos.length < 3) {
            setTelefonos([
                ...telefonos,
                { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
            ]);
        }
    };

    const eliminarTelefono = (id: number) => {
        if (telefonos.length > 1) {
            setTelefonos(telefonos.filter((t) => t.id !== id));
        }
    };

    const actualizarValorSimple = (id: number, valor: string) => {
        setTelefonos(telefonos.map(t => t.id === id ? { ...t, numero: valor.replace(/\D/g, '') } : t));
    };

    return (
        <div className="flex flex-col gap-5 w-full max-w-2xl">
            {telefonos.map((tel, index) => (
                <div key={tel.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                    {/* Etiqueta de la maquetación original */}
                    <label className="w-full md:w-40 font-medium text-stone-700 pt-2">
                        {index === 0 ? 'Teléfono:' : `Teléfono ${index + 1}:`}
                    </label>

                    <div className="flex-1 flex items-start gap-2">
                        {/* Selector de País (Visual) */}
                        <select
                            className="bg-white border border-stone-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-amber-600 outline-none h-[42px] cursor-pointer"
                            defaultValue="Bolivia"
                        >
                            {PAISES.map((p) => (
                                <option key={p.nombre} value={p.nombre}>
                                    {p.flag} {p.codigo}
                                </option>
                            ))}
                        </select>

                        {/* Input de número (Visual) */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="70000000"
                                value={tel.numero}
                                onChange={(e) => actualizarValorSimple(tel.id, e.target.value)}
                                className="w-full bg-white border border-stone-300 px-3 py-2 rounded focus:ring-1 focus:ring-amber-600 outline-none h-[42px]"
                            />
                        </div>

                        {/* Botones de acción del esqueleto */}
                        <div className="flex items-center gap-2 h-[42px]">
                            {index === 0 && telefonos.length < 3 && (
                                <button
                                    onClick={agregarTelefono}
                                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-all shadow-sm"
                                >
                                    <Plus size={20} strokeWidth={2.5} />
                                </button>
                            )}

                            {index > 0 && (
                                <button
                                    onClick={() => eliminarTelefono(tel.id)}
                                    className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all rounded border border-stone-200"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}