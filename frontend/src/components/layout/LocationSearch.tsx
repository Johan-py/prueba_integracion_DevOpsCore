'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Loader2, X, History, Search } from 'lucide-react'
import { usePopularidad } from '@/hooks/usePopularidad'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { useDebounce } from '@/hooks/useDebounce'

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  isLocal?: boolean;
  nivel?: string;
  contexto?: string;
  locationId?: number;
}

type LocationSearchProps = {
  value: string
  onChange: (data: string | { nombre: string, lat?: number, lng?: number, locationId?: number }) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const { updateFilters } = useSearchFilters()
  const { registrarConsulta } = usePopularidad()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const [inputValue, setInputValue] = useState(value || '')
  const debouncedValue = useDebounce(inputValue, 400)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const recalcDropdown = () => {
    if (!containerRef.current) return
    setDropdownStyle({
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      width: '100%',
      zIndex: 50
    })
  }

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(recalcDropdown)
      window.addEventListener('resize', recalcDropdown)
      window.addEventListener('scroll', recalcDropdown, true)
      return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', recalcDropdown)
        window.removeEventListener('scroll', recalcDropdown, true)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const syncHistory = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        const visitorSaved = localStorage.getItem('visitorSearchHistory')
        const parsed = visitorSaved ? JSON.parse(visitorSaved) : []
        setHistory(parsed.slice(0, 10))
        return
      }
      try {
        const authSaved = localStorage.getItem('authSearchHistory')
        if (authSaved) setHistory(JSON.parse(authSaved))
        const res = await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const remoteHistory = data.map((h: any) => typeof h === 'string' ? h : h.termino).slice(0, 20)
          setHistory(remoteHistory)
          localStorage.setItem('authSearchHistory', JSON.stringify(remoteHistory))
        }
      } catch (error) { console.error("Error historial:", error) }
    }
    syncHistory()
    window.addEventListener('propbol:login', syncHistory)
    window.addEventListener('propbol:session-changed', syncHistory)
    return () => {
      window.removeEventListener('propbol:login', syncHistory)
      window.removeEventListener('propbol:session-changed', syncHistory)
    }
  }, [API_BASE])

  const saveToHistory = async (item: string) => {
    if (!item.trim()) return
    const token = localStorage.getItem("token")
    const limit = token ? 20 : 10
    const updated = [item, ...history.filter(i => i !== item)].slice(0, limit)
    setHistory(updated)
    if (token) {
      localStorage.setItem('authSearchHistory', JSON.stringify(updated))
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ termino: item })
        })
      } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('visitorSearchHistory', JSON.stringify(updated))
    }
  }

  const handleDeleteHistoryItem = async (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")
    const updated = history.filter((h) => h !== term)
    setHistory(updated)
    if (token) {
      localStorage.setItem('authSearchHistory', JSON.stringify(updated))
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda/${encodeURIComponent(term)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('visitorSearchHistory', JSON.stringify(updated))
    }
  }

  useEffect(() => {
    const searchAll = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([])
        return
      }
    // NUEVA LÓGICA DE LOADER (AC: 1000ms)
    // Iniciamos un temporizador. El loader solo será 'true' si pasan 1000ms.
    const loaderTimer = setTimeout(() => {
      setIsLoading(true);
    }, 1000);
      setIsLoading(true)
      try {
        const resLocal = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(debouncedValue)}`)
        let localResults: MapboxFeature[] = []
        if (resLocal.ok) {
          const dataLocal = await resLocal.json()
          localResults = dataLocal.map((loc: any) => ({
            id: `local-${loc.id}`,
            text: loc.nombre,
            place_name: loc.contexto,
            center: [0, 0],
            locationId: loc.id,
            nivel: loc.nivel,
            isLocal: true
          }))
        }
        const matchInterseccion = debouncedValue.match(/(.+?)\s+y\s+(.+)/i);
        let osmResults: MapboxFeature[] = []
        if (matchInterseccion) {
          const bbox = "-22.9068,-69.6445,-9.6806,-57.4539";
          const queryOSM = `[out:json][timeout:5];way["name"~"${matchInterseccion[1]}", i](${bbox})->.w1;way["name"~"${matchInterseccion[2]}", i](${bbox})->.w2;node(w.w1)(w.w2);out center;`;
          const resOSM = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(queryOSM)
          })
          const dataOSM = await resOSM.json()
          osmResults = dataOSM.elements.map((el: any) => ({
            id: `osm-${el.id}`,
            text: `${matchInterseccion[1].toUpperCase()} Y ${matchInterseccion[2].toUpperCase()}`,
            place_name: "Intersección (Cochabamba)",
            center: [el.lon, el.lat]
          }))
        }
        const resMapbox = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedValue)}.json?access_token=${MAPBOX_TOKEN}&country=bo&language=es&autocomplete=true&types=address,neighborhood,locality,poi`
        )
        const dataMapbox = await resMapbox.json()
        const mapboxResults = dataMapbox.features || []
        setSuggestions([...localResults, ...osmResults, ...mapboxResults])
      } catch (e) { console.error(e) }
      finally {
        // Si el servidor respondió en menos de 1000ms, esto cancela el temporizador y el loader NUNCA se muestra.
        clearTimeout(loaderTimer); 
        setIsLoading(false);
      }
    }
    searchAll()
  }, [debouncedValue, API_BASE, MAPBOX_TOKEN])

const handleSelect = (place: MapboxFeature) => {
    const nombre = place.text
    setInputValue(nombre)
    saveToHistory(nombre)
    setIsOpen(false)
    
    if (place.isLocal && place.locationId) {
      // Es zona oficial de PropBol. Usamos locationId y NO enviamos coordenadas.
      onChange({ nombre, locationId: place.locationId })
      registrarConsulta(place.locationId, nombre)
      updateFilters({ locationId: place.locationId, query: nombre, lat: undefined, lng: undefined })
    } else {
      // Es una calle de Mapbox. Usamos coordenadas.
      onChange({ 
        nombre, 
        lat: place.center[1] !== 0 ? place.center[1] : undefined, 
        lng: place.center[0] !== 0 ? place.center[0] : undefined 
      })
      updateFilters({ 
        query: nombre, 
        lat: place.center[1], 
        lng: place.center[0], 
        locationId: undefined 
      })
    }
    setTimeout(() => containerRef.current?.closest('form')?.requestSubmit(), 100)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Geocodifica el término del historial antes de buscar
  const handleHistorySelect = async (term: string) => {
    setInputValue(term)
    setIsOpen(false) // Ocultamos el dropdown visualmente para UX fluida

    try {
      let isLocal = false
      let bestMatch: any = null

      // 1. Intentar con backend local
      const resLocal = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(term)}`)
      if (resLocal.ok) {
        const dataLocal = await resLocal.json()
        if (dataLocal.length > 0) {
          const loc = dataLocal[0]
          bestMatch = { nombre: loc.nombre, locationId: loc.id }
          isLocal = true
        }
      }

      // 2. Si no es local, intentar con Mapbox
      if (!bestMatch) {
        const resMapbox = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedValue)}.json?access_token=${MAPBOX_TOKEN}&country=bo&language=es&autocomplete=true&types=address,neighborhood,locality,poi`
        )
        const dataMapbox = await resMapbox.json()
        if (dataMapbox.features && dataMapbox.features.length > 0) {
          const place = dataMapbox.features[0]
          bestMatch = {
            nombre: place.text,
            lat: place.center[1],
            lng: place.center[0]
          }
        }
      }

      // 3. Pasar los datos completos (con coordenadas o locationId) al FilterBar
      if (bestMatch) {
        if (isLocal && bestMatch.locationId) {
          // Historial de zona oficial de PropBol (Sin coordenadas)
          onChange({ nombre: bestMatch.nombre, locationId: bestMatch.locationId })
          registrarConsulta(bestMatch.locationId, bestMatch.nombre)
          updateFilters({ locationId: bestMatch.locationId, query: bestMatch.nombre, lat: undefined, lng: undefined })
        } else {
          // Historial de calle de Mapbox (Con coordenadas)
          onChange({ nombre: bestMatch.nombre, lat: bestMatch.lat, lng: bestMatch.lng })
          updateFilters({
            query: bestMatch.nombre,
            lat: bestMatch.lat,
            lng: bestMatch.lng,
            locationId: undefined
          })
        }
      } else {
        onChange(term) // Fallback de seguridad
      }

      // 4. Forzar la búsqueda
      setTimeout(() => containerRef.current?.closest('form')?.requestSubmit(), 100)

    } catch (error) {
      console.error("Error al recuperar coordenadas del historial:", error)
      onChange(term)
      setTimeout(() => containerRef.current?.closest('form')?.requestSubmit(), 100)
    }
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className={`h-[40px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white dark:bg-stone-800 shadow-sm dark:text-stone-100 ${isOpen ? 'border-[#d97706] dark:border-[#E87C1E] ring-1 ring-[#d97706] dark:ring-[#E87C1E]' : 'border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E]'}`}>
        <MapPin className={`w-5 h-5 flex-shrink-0 ${inputValue ? 'text-[#d97706] dark:text-[#E87C1E]' : 'text-stone-400 dark:text-stone-400'}`} />
        
        <div className="relative flex-1 flex items-center w-full h-full min-w-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
            onFocus={() => { setIsOpen(true); recalcDropdown(); }}
            onKeyDown={(e) => e.key === 'Enter' && setIsOpen(false)}
            placeholder="Ej: Av. América, Plaza Colón, Cala Cala..."
            className="w-full bg-transparent outline-none text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-400 pr-[70px] h-full"
          />
          <div className="absolute right-0 flex items-center gap-2 bg-white dark:bg-stone-800 pl-2 h-full rounded-r-xl">
            {(inputValue.toLowerCase().includes('bolivia') || suggestions.some(s => s.isLocal)) && (
              <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={20} height={14} className="rounded-sm flex-shrink-0" />
            )}
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : inputValue && (
              <button onClick={() => { setInputValue(''); setSuggestions([]); onChange(''); }} type="button" className="p-1 hover:bg-stone-100 rounded-full">
                <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div style={dropdownStyle} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl overflow-hidden">
          {/* HISTORIAL: Solo cuando el input está vacío */}
          {inputValue === '' && history.length > 0 && (
            <div className="max-h-60 overflow-y-auto overscroll-contain">
              <div className="px-4 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Búsquedas recientes</span>
                {!localStorage.getItem("token") && (
                  <span className="text-[9px] text-stone-300 font-medium">Limite (Máx 10)</span>
                )}
              </div>
              {(showAll ? history : history.slice(0, 5)).map((item, idx) => (
                <div key={`hist-${idx}`} className="group flex items-center justify-between hover:bg-orange-50 dark:hover:bg-stone-700 border-b border-stone-50 dark:border-stone-700 last:border-0">
                  <button type="button" onClick={() => handleHistorySelect(item)} className="flex-1 px-4 py-3 flex items-center gap-3 text-left">
                    <History className="w-3.5 h-3.5 text-stone-400" />
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm text-stone-600 dark:text-stone-300">{item}</span>
                      <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={16} height={11} className="rounded-sm opacity-70" />
                    </div>
                  </button>
                  <button type="button" onClick={(e) => handleDeleteHistoryItem(e, item)} className="pr-4 opacity-100 md:opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 p-2">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {history.length > 5 && (
                <div className="flex justify-end border-t border-stone-50 dark:border-stone-700 bg-white dark:bg-stone-800">
                  <button type="button" onClick={() => setShowAll(!showAll)} className={`px-4 py-2 text-xs font-bold transition-colors ${showAll ? "text-stone-500 hover:text-stone-700" : "text-orange-500 hover:text-orange-600"}`}>
                    {showAll ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              )}
            </div>
          )}

          {inputValue.length >= 3 && (
            <div className="max-h-[300px] overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="px-4 py-6 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-sm text-stone-500 italic">Buscando zonas...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((place) => (
                  <button key={place.id} type="button" onClick={() => handleSelect(place)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50 dark:hover:bg-stone-700 border-b border-stone-50 dark:border-stone-700 last:border-0 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-200 truncate">{place.text}</span>
                        <span className="text-xs text-stone-400 truncate">{place.place_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {place.nivel && (
                        <div className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-500 rounded-md uppercase">{place.nivel}</div>
                      )}
                      <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={20} height={14} className="rounded-sm" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center bg-stone-50/50">
                  <p className="text-sm text-stone-600 font-medium">No se encontraron resultados</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}