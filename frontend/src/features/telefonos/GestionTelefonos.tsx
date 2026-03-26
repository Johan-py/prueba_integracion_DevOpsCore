"use client";

import React, { useState } from 'react';
import { User, Search, Menu, Trash2, Edit2, ChevronDown } from 'lucide-react';

export default function GestionTelefonos() {
    // Estados vacíos para iniciar el formulario desde cero
    const [telefonos, setTelefonos] = useState(['']);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');

    const addTelefono = () => {
        if (telefonos.length < 3) {
            setTelefonos([...telefonos, '']);
        }
    };

    const removeTelefono = (index: number) => {
        const nuevosTelefonos = telefonos.filter((_, i) => i !== index);
        setTelefonos(nuevosTelefonos);
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans w-full text-stone-900">
            {/* HEADER */}
            <header className="flex justify-between items-center p-4 border-b border-stone-100 bg-white mb-8">
                <div className="flex items-center gap-4">
                    <Menu size={24} />
                    <h1 className="text-xl font-bold">PropBol</h1>
                </div>
                <div className="flex gap-6 items-center">
                    <span className="font-medium cursor-pointer">Inicio</span>
                    <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center bg-stone-100">
                        <User className="text-stone-400" size={20}/>
                    </div>
                </div>
            </header>

            <main className="flex flex-col items-center px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold">Propiedades Destacadas</h2>
                    <p className="text-stone-500 text-sm">Selección exclusiva de inmuebles para ti</p>
                </div>

                {/* TARJETA PRINCIPAL */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 max-w-4xl w-full flex flex-col md:flex-row gap-10">

                    {/* PERFIL IZQUIERDO (VACÍO) */}
                    <div className="flex flex-col items-center md:w-1/3 border-r border-stone-100 pr-8">
                        <div className="w-28 h-28 rounded-full bg-stone-100 flex items-center justify-center mb-4 relative border border-stone-200">
                            <User className="text-stone-300 w-16 h-16" strokeWidth={1}/>
                            <button className="absolute bottom-0 right-0 bg-white border border-stone-200 rounded-full p-1.5 shadow-sm text-stone-600">
                                <span className="text-sm font-bold">＋</span>
                            </button>
                        </div>
                        <h3 className="font-bold">{nombre || "Nombre"}</h3>
                        <p className="text-stone-500 text-sm">{email || "correo@ejemplo.com"}</p>
                    </div>

                    {/* FORMULARIO DERECHO */}
                    <div className="flex-1 space-y-6">
                        <h3 className="text-center font-bold text-lg mb-6">Datos Personales</h3>

                        <div className="space-y-4">
                            {/* NOMBRE */}
                            <div className="flex items-center">
                                <label className="w-32 text-sm font-medium">Nombre Completo:</label>
                                <div className="flex-1 flex bg-[#FDF6F0] p-2 rounded-md border border-transparent items-center">
                                    <input
                                        className="bg-transparent flex-1 outline-none text-sm"
                                        placeholder="Tu nombre completo"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                    <Edit2 size={14} className="text-stone-400" />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="flex items-center">
                                <label className="w-32 text-sm font-medium">E-mail:</label>
                                <div className="flex-1 flex bg-[#FDF6F0] p-2 rounded-md border border-transparent items-center">
                                    <input
                                        className="bg-transparent flex-1 outline-none text-sm"
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Edit2 size={14} className="text-stone-400" />
                                </div>
                            </div>

                            {/* TELÉFONOS CON SELECTOR DE PAÍS */}
                            {telefonos.map((tel, index) => (
                                <div key={index} className="flex items-center">
                                    <label className="w-32 text-sm font-medium">
                                        {index === 0 ? "Teléfono:" : `Teléfono ${index + 1}:`}
                                    </label>
                                    <div className="flex-1 flex gap-2 items-center">
                                        <div className="flex-1 flex bg-[#FDF6F0] p-2 rounded-md border border-transparent items-center">
                                            {/* Selector de Bandera/País */}
                                            <div className="flex items-center gap-1 mr-3 pr-2 border-r border-stone-200 cursor-pointer">
                                                <span title="Bolivia">🇧🇴</span>
                                                <ChevronDown size={14} className="text-amber-600 font-bold" />
                                            </div>
                                            <input
                                                className="bg-transparent flex-1 outline-none text-sm"
                                                placeholder="78745578"
                                                value={tel}
                                                onChange={(e) => {
                                                    const newTels = [...telefonos];
                                                    newTels[index] = e.target.value;
                                                    setTelefonos(newTels);
                                                }}
                                            />
                                            <Edit2 size={14} className="text-stone-400" />
                                        </div>

                                        {index === 0 && telefonos.length < 3 && (
                                            <button onClick={addTelefono} className="text-stone-900 border border-stone-300 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-stone-100 transition-colors">
                                                <span className="text-xl">+</span>
                                            </button>
                                        )}
                                        {index > 0 && (
                                            <button onClick={() => removeTelefono(index)} className="text-stone-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* BOTÓN GUARDAR */}
                        <div className="flex justify-end mt-8">
                            <button className="bg-amber-600 text-white px-8 py-2.5 rounded-lg font-semibold shadow-md hover:bg-amber-700 transition-all active:scale-95">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}