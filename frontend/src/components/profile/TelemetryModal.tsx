'use client';
import React from 'react';

// 1. Agregamos onAccept a las propiedades esperadas
interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

// 2. Recibimos onAccept en los parámetros
const TelemetryModal: React.FC<TelemetryModalProps> = ({ isOpen, onClose, onAccept }) => {
  // Ya no necesitamos useRouter
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-700">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-7 m-4 border border-[#f5f5f4]">
        {/* Título - Piedra 900 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#292524] flex items-center justify-center gap-2">
            🏠 ¡Ayúdanos a encontrar tu lugar ideal!
          </h2>
        </div>

        {/* Cuerpo - Piedra 600 */}
        <div className="text-[#78716c] text-sm space-y-4 mb-8 leading-relaxed">
          <p>
            En <strong>PropBol</strong>, queremos que tu búsqueda sea lo más fluida posible. Para lograrlo, utilizamos herramientas de análisis que nos permiten entender mejor las tendencias del mercado inmobiliario.
          </p>

          {/* Caja informativa - Piedra 100 */}
          <ul className="space-y-3 bg-[#f5f5f4] p-5 rounded-lg border border-stone-200">
            <li className="flex gap-3">
              <span className="text-[#D97706] font-bold">•</span>
              <span><strong>Mejora automática:</strong> Al iniciar sesión, detectamos de forma segura tu zona geográfica de conexión para optimizar los resultados en tu área.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#D97706] font-bold">•</span>
              <span><strong>Personalización opcional:</strong> Puedes completar tu género y edad en tu perfil para que el sistema te sugiera propiedades más afines a ti.</span>
            </li>
          </ul>

          <p className="text-[11px] italic text-stone-500 text-center">
            * Recuerda que estos datos son completamente opcionales. Tu privacidad es nuestra prioridad y puedes dejar tu perfil vacío si así lo prefieres.
          </p>
        </div>

        {/* Botones - Ámbar y Piedra */}
        <div className="flex justify-end gap-3 font-semibold">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-stone-300 text-stone-500 rounded-md hover:bg-[#f5f5f4] transition-colors"
          >
            Entendido
          </button>

          {/* 3. CAMBIO AQUÍ: Nuevo texto y usamos onAccept */}
          <button
            className="px-5 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b45309] transition-all shadow-md active:scale-95"
            onClick={onAccept}
          >
            Completar mi perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelemetryModal;