import { useState, useEffect } from "react";
import { PropertyMapPin } from "@/types/property";
import { useSearchParams } from "next/navigation";

// Asegurarse de que NEXT_PUBLIC_API_URL esté en .env.local

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface UsePropertiesResult {
  properties: PropertyMapPin[];
  isLoading: boolean;
  error: string | null;
}

export function useProperties(): UsePropertiesResult {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyMapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      setIsLoading(true);
      setError(null);

      try {
        //Convertimos los parámetros de la URL en una query string
        const queryString = searchParams.toString();

        //Llamamos al endpoint de inmuebles con los filtros dinámicos
        const res = await fetch(
          `${API_URL}/api/properties/inmuebles?${queryString}`,
        );

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const json = await res.json();

        //Actualizamos el estado con los datos reales de la BD
        if (!cancelled) {
          const mappedData: PropertyMapPin[] = (json.data || []).map(
            (item: any) => ({
              id: item.id.toString(),
              // Accedemos a la latitud/longitud según UbicacionInmueble del schema
              lat: parseFloat(item.ubicacion?.latitud || 0),
              lng: parseFloat(item.ubicacion?.longitud || 0),
              price: parseFloat(item.precio),
              currency: "USD", // O el campo que definas en el schema
              type: (item.categoria?.toLowerCase() || "casa") as any,
              title: item.titulo,
            }),
          );
          setProperties(mappedData);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "Error al conectar con PropBol",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return { properties, isLoading, error };
}
