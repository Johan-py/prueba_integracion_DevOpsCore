const API_URL = 'http://localhost:5000/api'

export const api = {
  getPublicaciones: async () => {
    const res = await fetch(`${API_URL}/publicaciones/mias`, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '1'
      }
    })
    return res.json()
  },

  updatePublicacion: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '1'
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deletePublicacion: async (id: number) => {
    const res = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '1'
      }
    })
    return res.json()
  }
}