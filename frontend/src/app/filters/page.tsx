const handleSearch = async (filtros: any) => {
    const params = new URLSearchParams()
    
    // Mapeo dinámico para que funcione con cualquier versión del FilterBar
    if (filtros.tipoInmueble) filtros.tipoInmueble.forEach((t: string) => params.append('categoria', t))
    if (filtros.modoInmueble) filtros.modoInmueble.forEach((m: string) => params.append('tipoAccion', m))
    if (filtros.query) params.append('query', filtros.query)
      
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const response = await fetch(`${API_URL}/api/properties/search?${params.toString()}`)
      const data = await response.json()
      console.log('Resultados de búsqueda:', data)
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    }
  }