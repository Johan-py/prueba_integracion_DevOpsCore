import type { DetallePropiedad } from '@/types/detallePropiedad'

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
  }

  return apiUrl
}

export async function obtenerDetallePropiedad(id: number): Promise<DetallePropiedad> {
  const apiUrl = getApiUrl()

  const response = await fetch(`${apiUrl}/api/publicaciones/inmueble/${id}/detalle`, {
    method: 'GET',
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el detalle de la propiedad')
  }

  return data.data
}
