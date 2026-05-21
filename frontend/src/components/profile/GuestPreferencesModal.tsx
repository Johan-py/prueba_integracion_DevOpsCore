'use client';
import React, { useState } from 'react';

interface GuestPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestPreferencesModal: React.FC<GuestPreferencesModalProps> = ({ isOpen, onClose }) => {
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [zona, setZona] = useState('');
  const [error, setError] = useState(false); // ✅ Estado para el bug de validación

  if (!isOpen) return null;

  const handleSave = async () => {
    // 🛡️ CORRECCIÓN BUG 2: Validar que el género no esté vacío
    if (!genero) {
      setError(true);
      return; // Detiene la ejecución antes de llamar al backend
    }

    const payload = {
      genero: genero, // Ya no es undefined porque es obligatorio
      rango_edad: edad || undefined,
      zona_interes: zona || undefined
    };

    try {
      // ✅ SE MANTIENE LA INTEGRACIÓN DE TU COMPAÑERO
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/telemetria/visitante`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('guest_preferences', JSON.stringify({
          genero,
          rango_edad: edad,
          zona
        }));

        alert('¡Preferencias guardadas! Te mostraremos mejores resultados.');
        onClose();
      } else {
        alert(data.message || 'Error al guardar preferencias');
      }
    } catch (error) {
      console.error("Error guardando preferencias:", error);
      alert('Error al guardar preferencias');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-[#fdf6e6] rounded-xl shadow-2xl max-w-md w-full p-7 m-4 border border-[#e5dfd7]">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#292524]">
            Tus Preferencias
          </h2>
          <p className="text-sm text-stone-500 mt-2">Ayúdanos a filtrar lo mejor para ti.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
              Género: <span className="text-red-500">*</span>
            </label>
            <select
              value={genero}
              onChange={(e) => {
                setGenero(e.target.value);
                setError(false); // Limpia el error cuando el usuario selecciona algo
              }}
              className={`px-3 py-2 rounded text-sm bg-white border transition-all focus:outline-none focus:ring-1 ${
                error 
                  ? 'border-red-500 ring-red-500' 
                  : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500'
              }`}
            >
              <option value="">Seleccione...</option>
              <option value="MASCULINO">MASCULINO</option>
              <option value="FEMENINO">FEMENINO</option>
              <option value="OTRO">OTRO</option>
              <option value="PREFIERO_NO_DECIR">PREFIERO_NO_DECIR</option>
            </select>
            {error && (
              <span className="text-[10px] text-red-500 font-bold ml-1 animate-pulse">
                Este campo es obligatorio
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Rango de Edad:</label>
            <select
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="px-3 py-2 rounded text-sm bg-white border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Seleccione...</option>
              <option value="18-25">18 - 25 años</option>
              <option value="26-35">26 - 35 años</option>
              <option value="36-45">36 - 45 años</option>
              <option value="46-60">46 - 60 años</option>
              <option value="60+">Más de 60 años</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Zona de interés:</label>
            <input
              type="text"
              placeholder="Ej. Zona Norte, Cala Cala..."
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="px-3 py-2 rounded text-sm bg-white border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 font-semibold">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            className="px-5 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b45309] transition-all shadow-md active:scale-95 text-sm"
            onClick={handleSave}
          >
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestPreferencesModal;