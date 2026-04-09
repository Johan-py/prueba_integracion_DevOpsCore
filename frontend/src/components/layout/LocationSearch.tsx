"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MapPin, Search, Loader2, X, History } from "lucide-react";
import { usePopularidad } from "@/hooks/usePopularidad";
import { useSearchFilters } from "@/hooks/useSearchFilters";

type Location = {
  id: string | number;
  nombre: string;
  departamento: string;
};

type LocationSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { updateFilters } = useSearchFilters();
  const { registrarConsulta } = usePopularidad();

  const handleSelectLocation = (loc: Location) => {
    const fullName = `${loc.nombre} - ${loc.departamento} - Bolivia`;
    updateFilters({
      locationId: loc.id,
      query: fullName,
    });
    onChange(fullName);
    saveToHistory(fullName);
    setIsOpen(false);
    registrarConsulta(loc.id, fullName);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (item: string) => {
    const updatedHistory = [item, ...history.filter((i) => i !== item)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]/gi, "");
    onChange(cleanValue);
  };

  const isSelected = value.includes("Bolivia");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (value.trim().length < 2 || isSelected) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error buscando ubicaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timer);
  }, [value, isSelected]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <label className="block text-sm font-medium text-stone-700 mb-2 text-left md:text-center uppercase tracking-wide font-montserrat">
        Ciudad / Zona
      </label>

      <div
        className={`h-[46px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white shadow-sm ${
          isOpen && suggestions.length > 0
            ? "border-amber-600 ring-2 ring-amber-100"
            : "border-stone-300"
        }`}
      >
        <MapPin className={`w-5 h-5 flex-shrink-0 ${value ? "text-amber-600" : "text-stone-400"}`} />

        <div className="relative flex-1 flex items-center w-full h-full min-w-0">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Cochabamba, La Paz..."
            className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 font-inter pr-[70px] md:truncate overflow-x-auto whitespace-nowrap"
          />
          
          <div className="absolute right-0 flex items-center gap-2 bg-white pl-2 h-full">
            {isSelected && (
              <Image
                src="https://flagcdn.com/w20/bo.png"
                alt="BO"
                width={20}
                height={14}
                className="rounded-sm flex-shrink-0"
              />
            )}
            
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              value && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }} 
                  type="button"
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          {value.trim().length === 0 && history.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Búsquedas recientes
                </span>
              </div>
              {history.map((item, idx) => (
                <button
                  key={`hist-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                    updateFilters({ query: item });
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0"
                >
                  <History className="w-3.5 h-3.5 text-stone-300" />
                  <span className="text-sm text-stone-600">{item}</span>
                </button>
              ))}
            </div>
          )}

          {value.trim().length >= 2 && !isSelected && (
            <>
              {isLoading ? (
                <div className="px-4 py-6 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span className="text-sm text-stone-500 italic">Buscando zonas...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {suggestions.slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-sm font-bold text-stone-600">
                          {loc.nombre} - {loc.departamento} - Bolivia
                        </span>
                      </div>
                      <Image
                        src="https://flagcdn.com/w20/bo.png"
                        alt="BO"
                        width={20}
                        height={14}
                        className="rounded-sm"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center bg-stone-50/50">
                  <p className="text-sm text-stone-600 font-medium">No se encontraron resultados</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}