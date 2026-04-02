// --BitPro
export const usePopularidad = () => {
  const registrarConsulta = async (id: string | number, nombreCompleto: string) => {
    // 1. Registro en el Backend
    try {
      await fetch(`http://localhost:5000/api/locations/popularidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch (error) {
      console.error('Error al registrar popularidad', error)
    }

    // 2. Registro en LocalStorage para el Historial
    const historialKey = 'propbol_historial_busqueda'
    const historialActual = JSON.parse(localStorage.getItem(historialKey) || '[]')

    // Filtramos para que no haya duplicados y agregamos al inicio
    const nuevoHistorial = [
      { id, nombreCompleto },
      ...historialActual.filter((item: any) => item.id !== id)
    ].slice(0, 5) // Solo guardamos las últimas 5

    localStorage.setItem(historialKey, JSON.stringify(nuevoHistorial))
  }

  return { registrarConsulta }
}
