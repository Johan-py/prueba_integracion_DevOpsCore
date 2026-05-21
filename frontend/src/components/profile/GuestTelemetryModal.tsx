'use client';
import React from 'react';

interface GuestTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const GuestTelemetryModal: React.FC<GuestTelemetryModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-7 m-4 border border-[#f5f5f4]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#292524] flex items-center justify-center gap-2">
            👋 ¡Bienvenido a PropBol!
          </h2>
        </div>

        <div className="text-[#78716c] text-sm space-y-4 mb-8 leading-relaxed text-center">
          <p>
            Aún no has iniciado sesión, pero queremos mostrarte las mejores propiedades en tu zona.
          </p>
          <p>
            ¿Te gustaría personalizar tu experiencia para que te recomendemos inmuebles que realmente se ajusten a lo que buscas?
          </p>
        </div>

        <div className="flex justify-end gap-3 font-semibold">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 text-stone-500 rounded-md hover:bg-[#f5f5f4] transition-colors text-sm"
          >
            Entendido (Quizás luego)
          </button>
          <button 
            className="px-5 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b45309] transition-all shadow-md active:scale-95 text-sm"
            onClick={onAccept}
          >
            Personalizar búsqueda
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestTelemetryModal;