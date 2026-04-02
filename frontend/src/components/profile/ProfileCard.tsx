'use client'

import React, { useState } from "react";
import { Plus, Trash2, Pencil } from 'lucide-react';
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

  const [campoEditando, setCampoEditando] = useState<string | null>(null);

  const [nombre, setNombre] = useState("Condesa");
  const [pais, setPais] = useState("");
  const [genero, setGenero] = useState("");
  const [direccion, setDireccion] = useState("");

  const soloLetras = (value: string) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

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

  const handlePasswordSubmit = () => {
    setIsEmailEditable(true);
    setIsSecurityModalOpen(false);
  };

  const handleOtpSubmit = () => {
    setOriginalEmail(tempEmail);
    setIsEmailEditable(false);
    setIsOtpModalOpen(false);
  };

  return (
    <div className="bg-[#fdf6e6] border border-[#e5dfd7] shadow-sm p-8 rounded-xl flex flex-col md:flex-row gap-10 items-center">

      {/* PERFIL */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        {/* AVATAR */}
        <div className="w-28 h-28 rounded-full bg-white border border-gray-300 relative flex items-center justify-center shadow-sm mb-10">
          <span className="text-gray-500 text-xs uppercase">Imagen</span>
          <button
            className="
              absolute
              right-0 top-1/2 -translate-y-1/2
              md:right-1/2 md:translate-x-1/2 md:top-full md:mt-6
              w-8 h-8 bg-white border border-gray-300 rounded-full
              flex items-center justify-center shadow-sm hover:bg-gray-100
            "
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="mt-4 font-semibold text-lg">Perfil1</p>
        <p className="text-sm text-gray-500">{originalEmail}</p>
      </div>

      {/* FORMULARIO */}
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900">Datos Personales</h2>

        <div className="flex flex-col gap-4">
          {/* NOMBRE */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">
              Nombre Completo:
            </label>
            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                disabled={campoEditando !== "nombre"}
                value={nombre}
                onChange={(e) => setNombre(soloLetras(e.target.value))}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === "nombre"
                    ? "bg-white border border-amber-500"
                    : "bg-gray-200 cursor-not-allowed"}
                `}
              />
              <button onClick={() => setCampoEditando(campoEditando === "nombre" ? null : "nombre")}>
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 pt-2">E-mail:</label>
            <div className="flex-1 flex flex-col">
              <input
                type="email"
                className={`w-full px-3 py-2 rounded text-sm text-stone-700 
                  ${!isEmailEditable ? "bg-gray-200 cursor-pointer hover:bg-gray-300" : "bg-white border border-amber-500"}`}
                readOnly={!isEmailEditable}
                onClick={!isEmailEditable ? () => setIsSecurityModalOpen(true) : undefined}
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
              />
              {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
                <span className="text-red-500 text-xs mt-1">Formato de correo inválido</span>
              )}
            </div>
            <button onClick={() => setIsSecurityModalOpen(true)}>
              <Pencil size={16} />
            </button>
          </div>

          {/* TELÉFONOS */}
          {telefonos.map((tel, index) => {
            const keyCampo = `telefono-${tel.id}`;
            return (
              <div key={tel.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-40 font-medium text-stone-700">
                  {index === 0 ? "Teléfono:" : `Teléfono ${index + 1}:`}
                </label>
                <div className="flex w-full items-center gap-2">
                  <select
                    disabled={campoEditando !== keyCampo}
                    className={`px-2 py-2 rounded text-sm
                      ${campoEditando === keyCampo
                        ? "bg-white border border-amber-500"
                        : "bg-gray-200 cursor-not-allowed"}
                    `}
                  >
                    {PAISES.map((p) => (
                      <option key={p.nombre}>
                        {p.flag} {p.codigo}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ej. 70000000"
                    value={tel.numero}
                    disabled={campoEditando !== keyCampo}
                    onChange={(e) => actualizarTelefono(tel.id, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm
                      ${campoEditando === keyCampo
                        ? "bg-white border border-amber-500"
                        : "bg-gray-200 cursor-not-allowed"}
                    `}
                  />
                  <button
                    onClick={() =>
                      setCampoEditando(
                        campoEditando === keyCampo ? null : keyCampo
                      )
                    }
                    className="text-black"
                  >
                    <Pencil size={16} />
                  </button>
                  {index === 0 && telefonos.length < 3 && (
                    <button onClick={agregarTelefono}>
                      <Plus size={18} />
                    </button>
                  )}
                  {index > 0 && (
                    <button onClick={() => eliminarTelefono(tel.id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* PAÍS */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">
              País:
            </label>
            <div className="flex w-full items-center gap-2">
              <select
                disabled={campoEditando !== "pais"}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === "pais"
                    ? "bg-white border border-amber-500"
                    : "bg-gray-200 cursor-not-allowed"}
                `}
              >
                <option value="">Seleccione un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
              </select>
              <button
                onClick={() =>
                  setCampoEditando(campoEditando === "pais" ? null : "pais")
                }
                className="text-black"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* GÉNERO */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">
              Género:
            </label>
            <div className="flex w-full items-center gap-2">
              <select
                disabled={campoEditando !== "genero"}
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === "genero"
                    ? "bg-white border border-amber-500"
                    : "bg-gray-200 cursor-not-allowed"}
                `}
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <button
                onClick={() =>
                  setCampoEditando(campoEditando === "genero" ? null : "genero")
                }
                className="text-black"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">Dirección:</label>
            <div className="flex w-full items-center gap-2">
              <input
                disabled={campoEditando !== "direccion"}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === "direccion"
                    ? "bg-white border border-amber-500"
                    : "bg-gray-200 cursor-not-allowed"}
                `}
              />
              <button onClick={() => setCampoEditando(campoEditando === "direccion" ? null : "direccion")}>
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => {
                setCampoEditando(null);
                setNombre("Condesa");
                setPais("");
                setGenero("");
                setDireccion("");
                setTempEmail(originalEmail);
              }}
              className="text-stone-600 hover:text-black text-sm"
            >
              Cancelar
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} onSubmit={handlePasswordSubmit} />
      <OtpModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onSubmit={handleOtpSubmit} onResendCode={() => {}} />

    </div>
  );
}