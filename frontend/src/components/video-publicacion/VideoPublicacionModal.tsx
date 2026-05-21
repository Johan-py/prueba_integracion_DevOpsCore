'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import VideoPublicacionCard from './VideoPublicacionCard';

type TutorialContent = {
  titulo?: string;
  mensaje?: string;
  requisitos?: string[];
  videoUrl?: string;
  thumbnailUrl?: string | null;
  subtitlesUrl?: string | null;
  checkboxLabel?: string;
};

type Props = {
  contenido?: TutorialContent | null;
  onClose: () => void;
  onContinue: () => void;
};

export default function VideoPublicacionModal({
  contenido,
  onClose,
  onContinue,
}: Props) {
  const [aceptado, setAceptado] = useState(false);

  const titulo = contenido?.titulo || 'Antes de publicar tu propiedad';

  const mensaje =
    contenido?.mensaje ||
    'Mira este video y conoce qué necesitas tener listo para crear tu publicación de forma exitosa.';

  const requisitos = contenido?.requisitos || [
    'Datos generales del inmueble',
    'Ubicación del inmueble',
    'Precio y características principales',
    'Fotos o contenido multimedia',
  ];

  const checkboxLabel =
    contenido?.checkboxLabel ||
    'Sí entiendo qué necesito para publicar una propiedad';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <section className="relative w-full max-w-[600px] rounded-2xl bg-white px-6 py-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar tutorial"
        >
          <X size={22} />
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>

          <p className="mx-auto mt-2 max-w-[500px] text-sm leading-5 text-gray-500">
            {mensaje}
          </p>

          <p className="mt-4 text-sm font-semibold text-gray-900">
            Video explicativo
          </p>
        </div>

        <VideoPublicacionCard />

        <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3">
          <p className="mb-1 text-sm font-bold text-gray-900">
            Antes de continuar, ten listo:
          </p>

          <ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-600">
            {requisitos.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={aceptado}
            onChange={(e) => setAceptado(e.target.checked)}
            className="h-5 w-5 rounded border-orange-500 accent-orange-500"
          />
          {checkboxLabel}
        </label>

        <button
          type="button"
          disabled={!aceptado}
          onClick={onContinue}
          className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white ${
            aceptado
              ? 'bg-orange-400 hover:bg-orange-500'
              : 'cursor-not-allowed bg-orange-300 opacity-70'
          }`}
        >
          Continuar
        </button>
      </section>
    </div>
  );
}
