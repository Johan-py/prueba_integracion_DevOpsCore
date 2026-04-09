import type { MisPublicacionesItem } from '@/types/publicacion'

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
  }

  return apiUrl
}

function getToken() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No hay sesión activa. Inicia sesión nuevamente.')
  }

  return token
}

export async function obtenerMisPublicaciones(): Promise<MisPublicacionesItem[]> {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/mias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
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
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar la publicación')
  }

  return data
}
