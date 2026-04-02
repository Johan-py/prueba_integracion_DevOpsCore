'use client'

import React, { useState } from "react";
import { Plus, Trash2 } from 'lucide-react';
import SecurityModal from "./SecurityModal";
import OtpModal from "./OtpModal";

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

export default function ProfileCard() {
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [isEmailEditable, setIsEmailEditable] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("perfil1@gmail.com");
    const [tempEmail, setTempEmail] = useState("perfil1@gmail.com");

    const [telefonos, setTelefonos] = useState<Telefono[]>([
        { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
    ]);

    const agregarTelefono = () => {
        if (telefonos.length < 3) {
            setTelefonos([...telefonos, { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }]);
        }
    };

    const eliminarTelefono = (id: number) => {
        if (telefonos.length > 1) {
            setTelefonos(telefonos.filter((t) => t.id !== id));
        }
    };

    const actualizarTelefono = (id: number, valor: string) => {
        setTelefonos(telefonos.map((t) =>
            t.id === id ? { ...t, numero: valor.replace(/\D/g, '') } : t
        ));
    };

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const canSave = tempEmail !== originalEmail && isValidEmail(tempEmail);

    const handleSaveClick = () => {
        if (!canSave) return;
        setIsOtpModalOpen(true);
    };

    const handlePasswordSubmit = (_password: string) => {
        setIsEmailEditable(true);
        setIsSecurityModalOpen(false);
    };

    const handleOtpSubmit = (_code: string) => {
        setOriginalEmail(tempEmail);
        setIsEmailEditable(false);
        setIsOtpModalOpen(false);
    };

    return (
        <div className="bg-gray-100 p-8 rounded-xl flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="flex flex-col items-center justify-center w-full md:w-1/3">
                <div className="w-28 h-28 rounded-full bg-gray-300"></div>
                <p className="mt-4 font-semibold text-lg">Perfil1</p>
                <p className="text-sm text-gray-500">{originalEmail}</p>
            </div>

            <div className="w-full md:w-2/3">
                <h2 className="text-xl font-bold mb-6 text-stone-900">Datos Personales</h2>

                <div className="flex flex-col gap-4">
                    {/* Nombre Completo */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <label className="w-full md:w-40 font-medium text-stone-700">Nombre Completo:</label>
                        <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />
                    </div>

                    {/* E-mail */}
                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                        <label className="w-full md:w-40 font-medium text-stone-700 pt-2">E-mail:</label>
                        <div className="flex-1 flex flex-col">
                            <input
                                type="email"
                                className={`w-full bg-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 ${!isEmailEditable ? "cursor-pointer hover:bg-gray-300" : "bg-white border border-amber-600"}`}
                                readOnly={!isEmailEditable}
                                onClick={!isEmailEditable ? () => setIsSecurityModalOpen(true) : undefined}
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                            />
                            {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
                                <span className="text-red-500 text-xs mt-1">Formato de correo inválido</span>
                            )}
                        </div>
                    </div>

                    {/* Teléfonos Dinámicos */}
                    {telefonos.map((tel, index) => (
                        <div key={tel.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                            <label className="w-full md:w-40 font-medium text-stone-700 pt-2">
                                {index === 0 ? 'Teléfono:' : `Teléfono ${index + 1}:`}
                            </label>
                            <div className="flex-1 flex items-start gap-2">
                                <select className="bg-white border border-stone-300 rounded px-2 py-2 text-sm h-[42px]">
                                    {PAISES.map((p) => <option key={p.nombre}>{p.flag} {p.codigo}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="70000000"
                                    value={tel.numero}
                                    onChange={(e) => actualizarTelefono(tel.id, e.target.value)}
                                    className="flex-1 bg-white border border-stone-300 px-3 py-2 rounded h-[42px]"
                                />
                                <div className="flex items-center gap-2 h-[42px]">
                                    {index === 0 && telefonos.length < 3 && (
                                        <button onClick={agregarTelefono} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50">
                                            <Plus size={20} strokeWidth={2.5} />
                                        </button>
                                    )}
                                    {index > 0 && (
                                        <button onClick={() => eliminarTelefono(tel.id)} className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded border border-stone-200">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <label className="w-full md:w-40 font-medium text-stone-700">País:</label>
                        <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <label className="w-full md:w-40 font-medium text-stone-700">Género:</label>
                        <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <label className="w-full md:w-40 font-medium text-stone-700">Dirección:</label>
                        <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />
                    </div>

                    {isEmailEditable && (
                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsEmailEditable(false); setTempEmail(originalEmail); }}
                                className="px-4 py-2 text-stone-600 mr-3 hover:bg-stone-200 rounded transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveClick}
                                disabled={!canSave}
                                className={`px-4 py-2 rounded font-medium ${canSave ? "bg-amber-600 text-white" : "bg-stone-300 text-stone-500 cursor-not-allowed"}`}
                            >
                                Guardar cambios
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} onSubmit={handlePasswordSubmit} />
            <OtpModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onSubmit={handleOtpSubmit} onResendCode={() => {}} />
        </div>
    );
}