'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Propiedad {
    id: number
    titulo: string
    ubicacion: string
    precio: number
    superficie: number
    categoria: string
    tipoAccion: string
}

interface Comparacion {
    id: number
    nombre: string
    fecha: string
    propiedades: Propiedad[]
}

export default function MisComparacionesPage() {
    const [filtro, setFiltro] = useState('Ver Todas')
    const [comparaciones, setComparaciones] = useState<Comparacion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const categorias = ['Ver Todas', 'Casas', 'Departamentos', 'Terrenos']

    const getToken = () => localStorage.getItem('token')

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const verDetalle = (id: number) => {
        router.push(`/detalle-propiedad/${id}`)
    }

    const getCategoriaEndpoint = (filtro: string): string | null => {
        const map: Record<string, string> = {
            Casas: 'CASA',
            Departamentos: 'DEPARTAMENTO',
            Terrenos: 'TERRENO'
        }
        return map[filtro] || null
    }

    const transformarComparacion = (comp: any): Comparacion => {
        if (comp.propiedades) return comp

        return {
            id: comp.id,
            nombre: comp.nombre,
            fecha: comp.creadoEn,
            propiedades:
                comp.detalle_comparacion?.map((detalle: any) => ({
                    id: detalle.inmueble.id,
                    titulo: detalle.inmueble.titulo,
                    ubicacion:
                        detalle.inmueble.ubicacion?.zona ||
                        detalle.inmueble.ubicacion?.ciudad ||
                        'Ubicación no disponible',
                    precio: detalle.inmueble.precio,
                    superficie: detalle.inmueble.superficieM2,
                    categoria: detalle.inmueble.categoria,
                    tipoAccion: detalle.inmueble.tipo_accion || detalle.inmueble.tipoAccion
                })) || []
        }
    }

    const fetchComparaciones = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = getToken()
            let url = `${API_BASE_URL}/api/comparaciones`

            if (filtro !== 'Ver Todas') {
                const categoriaEndpoint = getCategoriaEndpoint(filtro)
                if (categoriaEndpoint) {
                    url = `${API_BASE_URL}/api/comparaciones/categoria/${categoriaEndpoint}`
                }
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) throw new Error('Error al cargar las comparaciones')

            const data = await response.json()
            const transformedData = Array.isArray(data) ? data.map(transformarComparacion) : []
            setComparaciones(transformedData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }, [filtro, API_BASE_URL])

    useEffect(() => {
        fetchComparaciones()
    }, [fetchComparaciones])

    const eliminarComparacion = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta comparación?')) return
        try {
            const token = getToken()
            const response = await fetch(`${API_BASE_URL}/api/comparaciones/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) throw new Error('Error al eliminar la comparación')
            await fetchComparaciones()
        } catch (err) {
            alert('Error al eliminar la comparación')
        }
    }

    const comparacionesAgrupadas = () => {
        const grouped: Record<string, Comparacion[]> = {
            DEPARTAMENTO: [],
            CASA: [],
            TERRENO: [],
            OTROS: []
        }

        comparaciones.forEach((comp) => {
            const categoriaPrincipal = comp.propiedades[0]?.categoria || 'OTROS'
            const categoriaKey = categoriaPrincipal as keyof typeof grouped
            if (grouped[categoriaKey]) {
                grouped[categoriaKey].push(comp)
            } else {
                grouped['OTROS'].push(comp)
            }
        })
        return grouped
    }

    const getCategoriaNombre = (categoria: string) => {
        const nombres: Record<string, string> = {
            DEPARTAMENTO: 'Departamentos',
            CASA: 'Casas',
            TERRENO: 'Terrenos',
            OTROS: 'Otras'
        }
        return nombres[categoria] || categoria
    }

    const formatPrecio = (precio: number) => `$${precio.toLocaleString()}`

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) return <div className="p-12 text-center">Cargando...</div>

    const grupos = comparacionesAgrupadas()

    return (
        <main className="min-h-screen bg-white p-4 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Historial de Comparaciones</h1>
                    <p className="text-gray-600">Revisa y retorna tus análisis previos de propiedades.</p>
                </header>

                {/* Filtros */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFiltro(cat)}
                            className={`px-6 py-2 rounded-xl border-2 font-medium transition-all ${
                                filtro === cat ? 'bg-[#E87B00] text-white border-[#E87B00]' : 'bg-white text-gray-500 border-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Listado de Grupos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {Object.entries(grupos).map(([categoria, comparacionesList]) => {
                        if (comparacionesList.length === 0) return null

                        return comparacionesList.map((comp) => (
                            <section key={comp.id} className="rounded-3xl border p-6 bg-white shadow-sm flex flex-col">
                                <div className="flex justify-between items-center mb-6">
<h2 className="font-bold text-gray-800">
    {comp.nombre 
        ? comp.nombre
            .replace(/Comparación/g, '') // Quita "Comparación"
            .replace(/[\d/]+/g, '')      // Quita la fecha (números y barras)
            .replace(/^\s*de\s+/i, '')   // Quita el "de " si quedó al principio
            .trim() || getCategoriaNombre(categoria)
        : getCategoriaNombre(categoria)
    }
</h2>
                                    <span className="text-xs text-gray-400">{formatFecha(comp.fecha)}</span>
                                </div>

                                {/* Grid de Propiedades dentro de la comparación */}
                                <div className={`grid gap-4 mb-8 grid-cols-1 sm:grid-cols-2 ${comp.propiedades.length > 2 ? 'md:grid-cols-3' : ''}`}>
                                    {comp.propiedades.map((prop) => (
                                        /*CARD CLICKEABLE */
                                        <div
                                            key={prop.id}
                                            onClick={() => verDetalle(prop.id)}
                                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:border-[#E87B00] hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="h-28 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                                <span className="text-gray-400 text-xs">📷 Imagen</span>
                                                {/* Overlay sutil al hacer hover */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </div>

                                            <div className="p-3 text-[13px]">
                                                <p className="font-bold text-black mb-1 truncate group-hover:text-[#E87B00] transition-colors">
                                                    {prop.titulo}
                                                </p>
                                                <p className="text-gray-600 truncate"><strong>Ubicación:</strong> {prop.ubicacion}</p>
                                                <p className="text-black font-semibold">{formatPrecio(prop.precio)}</p>
                                                <p className="text-gray-500">{prop.superficie}m²</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => eliminarComparacion(comp.id)}
                                    className="mt-auto mx-auto flex items-center gap-2 px-6 py-2 border border-[#F3C291] text-[#E87B00] rounded-xl font-bold hover:bg-orange-50 transition-colors"
                                >
                                    <Trash2 size={16} /> Eliminar comparación
                                </button>
                            </section>
                        ))
                    })}
                </div>
            </div>
        </main>
    )
}