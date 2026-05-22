"use client";

import { ErrorValidacion } from "../../types/publicacion";
import { agruparErroresPorSeccion } from "../../lib/publicarValidator";

interface Props {
  errores: ErrorValidacion[];
  onClickError: (campo: string) => void;
}

export default function ErrorPanel({ errores, onClickError }: Props) {
  const agrupados = agruparErroresPorSeccion(errores);

  if (errores.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-red-500 text-xl">⚠️</span>
        <div>
          <p className="font-bold text-red-600 text-sm">Errores Detectados</p>
          <p className="text-red-500 text-xs">
            Se encontraron {errores.length} error(es) en la publicación
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {Object.entries(agrupados).map(([seccion, lista]) =>
          (lista as ErrorValidacion[]).map((error: ErrorValidacion, i: number) => (
            <button
              key={`${seccion}-${i}`}
              onClick={() => onClickError(error.campo as string)}
              className="w-full rounded-md border border-red-100 bg-white px-3 py-2 text-left transition hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <p className="text-xs font-semibold text-gray-500">{seccion}</p>
              <p className="text-sm text-gray-700">{error.mensaje}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}