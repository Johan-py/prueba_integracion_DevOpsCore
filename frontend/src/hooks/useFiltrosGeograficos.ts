import { useState, useEffect, useRef } from 'react'
import { useSearchFilters } from './useSearchFilters'

export interface GeoOption {
  id: number | 'todos'
  nombre: string
}

const OPCION_TODOS: GeoOption = { id: 'todos', nombre: 'Todos' }
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const useFiltrosGeograficos = () => {
  const { updateFilters } = useSearchFilters()
  const updateFiltersRef = useRef(updateFilters)
  useEffect(() => {
    updateFiltersRef.current = updateFilters
  }, [updateFilters])

  // Estados de selección 
  const [departamento, setDepartamento] = useState<number | 'todos'>('todos')
  const [provincia, setProvincia] = useState<number | 'todos'>('todos')
  const [municipio, setMunicipio] = useState<number | 'todos'>('todos')
  const [zona, setZona] = useState<number | 'todos'>('todos')
  const [barrio, setBarrio] = useState<number | 'todos'>('todos')

  // Listas de datos 
  const [listaDepartamentos, setListaDepartamentos] = useState<GeoOption[]>([OPCION_TODOS])
  const [listaProvincias, setListaProvincias] = useState<GeoOption[]>([OPCION_TODOS])
  const [listaMunicipios, setListaMunicipios] = useState<GeoOption[]>([OPCION_TODOS])
  const [listaZonas, setListaZonas] = useState<GeoOption[]>([OPCION_TODOS])
  const [listaBarrios, setListaBarrios] = useState<GeoOption[]>([OPCION_TODOS])

  const inyectarTodos = (data: any): GeoOption[] => {
    const arreglo = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    return [
      OPCION_TODOS, 
      ...arreglo.map((item: any) => ({ id: item.id, nombre: item.nombre }))
    ]
  }

  // --- TAREA 5: FETCH Y CARGA EN CASCADA ---

  // 1. Cargar Departamentos al inicio
  useEffect(() => {
    fetch(`${API_BASE}/api/locations/departamentos`)
      .then(res => res.json())
      .then(data => setListaDepartamentos(inyectarTodos(data)))
      .catch(err => console.error("Error al cargar departamentos", err))
  }, [])

  // 2. Si cambia Departamento -> Cargar Provincias
  useEffect(() => {
    if (departamento !== 'todos') {
      fetch(`${API_BASE}/api/locations/departamentos/${departamento}/provincias`)
        .then(res => res.json())
        .then(data => setListaProvincias(inyectarTodos(data)))
        .catch(err => console.error("Error al cargar provincias", err))
    } else {
      setListaProvincias([OPCION_TODOS])
    }
  }, [departamento])

  // 3. Si cambia Provincia -> Cargar Municipios
  useEffect(() => {
    if (provincia !== 'todos') {
      fetch(`${API_BASE}/api/locations/provincias/${provincia}/municipios`)
        .then(res => res.json())
        .then(data => setListaMunicipios(inyectarTodos(data)))
        .catch(err => console.error("Error al cargar municipios", err))
    } else {
      setListaMunicipios([OPCION_TODOS])
    }
  }, [provincia])

  // 4. Si cambia Municipio -> Cargar Zonas
  useEffect(() => {
    if (municipio !== 'todos') {
      fetch(`${API_BASE}/api/locations/municipios/${municipio}/zonas`)
        .then(res => res.json())
        .then(data => setListaZonas(inyectarTodos(data)))
        .catch(err => console.error("Error al cargar zonas", err))
    } else {
      setListaZonas([OPCION_TODOS])
    }
  }, [municipio])

  // 5. Si cambia Zona -> Cargar Barrios
  useEffect(() => {
    if (zona !== 'todos') {
      fetch(`${API_BASE}/api/locations/zonas/${zona}/barrios`)
        .then(res => res.json())
        .then(data => setListaBarrios(inyectarTodos(data)))
        .catch(err => console.error("Error al cargar barrios", err))
    } else {
      setListaBarrios([OPCION_TODOS])
    }
  }, [zona])

  // --- MANEJADORES CON RESETEO DESCENDENTE (Tarea 5) ---
  const handleCambioDepto = (v: number | 'todos') => {
    setDepartamento(v);
    setProvincia('todos');
    setMunicipio('todos');
    setZona('todos');
    setBarrio('todos');
  }

  const handleCambioProv = (v: number | 'todos') => {
    setProvincia(v);
    setMunicipio('todos');
    setZona('todos');
    setBarrio('todos');
  }

  const handleCambioMunicipio = (v: number | 'todos') => {
    setMunicipio(v);
    setZona('todos');
    setBarrio('todos');
  }

  const handleCambioZona = (v: number | 'todos') => {
    setZona(v);
    setBarrio('todos');
  }

  const handleCambioBarrio = (v: number | 'todos') => {
    setBarrio(v);
  }

  // --- SINCRONIZACIÓN CON EL ESTADO GLOBAL ---
  // Cuando cualquier selección cambia, actualizamos el useSearchFilters
  useEffect(() => {
    updateFilters({
      departamentoId: departamento === 'todos' ? undefined : departamento,
      provinciaId: provincia === 'todos' ? undefined : provincia,
      municipioId: municipio === 'todos' ? undefined : municipio,
      zonaId: zona === 'todos' ? undefined : zona,
      barrioId: barrio === 'todos' ? undefined : barrio,
    })
  }, [departamento, provincia, municipio, zona, barrio])

  return {
    selecciones: { departamento, provincia, municipio, zona, barrio },
    listas: { 
      departamentos: listaDepartamentos, 
      provincias: listaProvincias, 
      municipios: listaMunicipios, 
      zonas: listaZonas, 
      barrios: listaBarrios 
    },
    handlers: { 
      onDepartamentoChange: handleCambioDepto, 
      onProvinciaChange: handleCambioProv,
      onMunicipioChange: handleCambioMunicipio,
      onZonaChange: handleCambioZona,
      onBarrioChange: handleCambioBarrio
    },
    bloqueos: { // Tarea 4
      provinciaDisabled: departamento === 'todos',
      municipioDisabled: provincia === 'todos',
      zonaDisabled: municipio === 'todos',
      barrioDisabled: zona === 'todos'
    }
  }
}