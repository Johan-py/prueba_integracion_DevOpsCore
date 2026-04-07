"use client";

import PublicacionCard from "@/components/publicacion/PublicacionCard";
import { useMisPublicaciones } from "@/hooks/useMisPublicaciones";

export default function MisPublicacionesPage() {
  const { publicaciones, loading, error, removerPublicacionDeLista } =
    useMisPublicaciones();

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">Cargando publicaciones...</div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-red-600 sm:px-6 lg:px-8">{error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-black sm:mb-8">
        Mis publicaciones
      </h1>

      {publicaciones.length === 0 ? (
        <p>No tienes publicaciones activas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {publicaciones.map((publicacion) => (
            <div
              key={publicacion.id}
              className="mx-auto w-full max-w-[360px] sm:max-w-none"
            >
              <PublicacionCard
                publicacion={publicacion}
                onDeleted={removerPublicacionDeLista}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
