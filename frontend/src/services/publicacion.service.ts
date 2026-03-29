import type { MisPublicacionesItem } from '@/types/publicacion'

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
}

export async function obtenerMisPublicaciones(): Promise<MisPublicacionesItem[]> {
  const response = await fetch(`${API_URL}/api/publicaciones/mias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '1' // temporal hasta integrar auth/perfil
    },
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las publicaciones')
  }

  return data.data
}

export async function eliminarPublicacion(id: number) {
  const response = await fetch(`${API_URL}/api/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '1' // temporal hasta integrar auth/perfil
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar la publicación')
  }

  return data
}
