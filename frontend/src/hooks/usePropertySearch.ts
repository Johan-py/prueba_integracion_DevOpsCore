"use client";

import { useCallback, useState } from "react";
import { GlobalFilters } from "@/types/filters";

export function usePropertySearch() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const searchProperties = useCallback(async () => {
    const saved = sessionStorage.getItem("propbol_global_filters");
    if (!saved) return;

    const filters: GlobalFilters = JSON.parse(saved);
    const params = new URLSearchParams();

    if (filters.tipoInmueble && filters.tipoInmueble.length > 0) {
      filters.tipoInmueble.forEach((tipo) => {
        params.append("categoria", tipo);
      });
    }

    if (filters.modoInmueble && Array.isArray(filters.modoInmueble)) {
      filters.modoInmueble.forEach((modo) => {
        params.append("tipoAccion", modo);
      });
    }

    if (filters.locationId)
      params.append("locationId", filters.locationId.toString());
    if (filters.query) params.append("search", filters.query);

    try {
      setLoading(true);
      // Cambiamos localhost:5000 por tu variable de entorno para que funcione en Railway
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${API_URL}/api/properties/search?${params.toString()}`,
      );
      const json = await res.json();
      setData(json.data || json);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    data,
    loading,
    searchProperties,
  };
}
