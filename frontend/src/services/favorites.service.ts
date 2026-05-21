function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
  }

  return apiUrl
}

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function getFavoriteStatus(inmuebleId: number) {
  const apiUrl = getApiUrl()
  const token = getToken()

  if (!token) {
    return { is_favorite: false }
  }

  const response = await fetch(`${apiUrl}/api/favorites/status/${inmuebleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el estado del favorito')
  }

  return data
}

export async function addFavorite(inmuebleId: number) {
  const apiUrl = getApiUrl()
  const token = getToken()

  if (!token) {
    throw new Error('NO_AUTH')
  }

  const response = await fetch(`${apiUrl}/api/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ inmuebleId })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo agregar a favoritos')
  }

  return data
}

export async function removeFavorite(inmuebleId: number) {
  const apiUrl = getApiUrl()
  const token = getToken()

  if (!token) {
    throw new Error('NO_AUTH')
  }

  const response = await fetch(`${apiUrl}/api/favorites/${inmuebleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar de favoritos')
  }

  return data
}
