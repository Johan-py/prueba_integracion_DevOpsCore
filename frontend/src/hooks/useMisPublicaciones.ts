"use client";

import { useEffect, useState } from "react";
import { obtenerMisPublicaciones } from "@/services/publicacion.service";
import type { MisPublicacionesItem } from "@/types/publicacion";

export function useMisPublicaciones() {
  const [publicaciones, setPublicaciones] = useState<MisPublicacionesItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await obtenerMisPublicaciones();
        setPublicaciones(data);
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las publicaciones";
        setError(mensaje);
      } finally {
        setLoading(false);
      }
    };

    void cargar();
  }, []);

  const removerPublicacionDeLista = (id: number) => {
    setPublicaciones((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    publicaciones,
    loading,
    error,
    removerPublicacionDeLista,
  };
}
