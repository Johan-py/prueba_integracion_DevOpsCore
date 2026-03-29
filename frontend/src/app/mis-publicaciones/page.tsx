'use client'

import PublicacionCard from '@/components/publicacion/PublicacionCard'
import { useMisPublicaciones } from '@/hooks/useMisPublicaciones'

export default function MisPublicacionesPage() {
  const {
    publicaciones,
    loading,
    error,
    removerPublicacionDeLista,
  } = useMisPublicaciones()

  if (loading) {
    return <div className="p-8">Cargando publicaciones...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Mis publicaciones</h1>

      {publicaciones.length === 0 ? (
        <p>No tienes publicaciones activas.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {publicaciones.map((publicacion) => (
            <PublicacionCard
              key={publicacion.id}
              publicacion={publicacion}
              onDeleted={removerPublicacionDeLista}
            />
          ))}
        </div>
      )}
    </div>
  )
}