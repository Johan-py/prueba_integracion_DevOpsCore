const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
}

export async function eliminarPublicacion(id: number) {
  const response = await fetch(`${API_URL}/api/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '1' // temporal para pruebas
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar la publicación')
  }

  return data
}
