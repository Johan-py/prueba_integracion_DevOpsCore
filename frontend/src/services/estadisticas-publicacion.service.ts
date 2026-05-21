const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }

  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const registrarVistaPublicacion = async (
  publicacionId: string | number
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/publicaciones/${publicacionId}/vistas`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar la vista de la publicación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar vista de publicación:", error);
    return null;
  }
};

export const registrarVistaInmueble = async (
  inmuebleId: string | number
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/inmuebles/${inmuebleId}/vistas`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar la vista del inmueble");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar vista de inmueble:", error);
    return null;
  }
};

export const registrarCompartidoPublicacion = async (
  publicacionId: string | number,
  plataforma?: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/publicaciones/${publicacionId}/compartidos`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          medio: plataforma || "general",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar el compartido de la publicación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar compartido de publicación:", error);
    return null;
  }
};

export const registrarCompartidoInmueble = async (
  inmuebleId: string | number,
  plataforma?: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/inmuebles/${inmuebleId}/compartidos`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          medio: plataforma || "general",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar el compartido del inmueble");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar compartido de inmueble:", error);
    return null;
  }
};

export const obtenerEstadisticasPublicacion = async (
  publicacionId: string | number
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/publicaciones/${publicacionId}/estadisticas`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las estadísticas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      visualizaciones: 0,
      compartidos: 0,
    };
  }
};

export const obtenerMisPropiedadesVistas = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/usuarios/me/propiedades-vistas`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las propiedades vistas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener mis propiedades vistas:", error);
    return [];
  }
};
// Alias para mantener compatibilidad con componentes ya creados
export const registrarVisualizacion = registrarVistaPublicacion;

export const registrarCompartido = registrarCompartidoPublicacion;
