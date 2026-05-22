// src/services/publicacion.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const publicacionService = {
  // Cambiar estado (Activa/Pausada)
  async toggleEstado(
    id: number,
    activa: boolean,
  ): Promise<{ ok: boolean; msg: string }> {
    const response = await fetch(
      `${API_URL}/api/perfil/usuario/publicaciones/${id}/estado`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ activa }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al cambiar el estado");
    }

    return data;
  },

  // Eliminar publicación
  async eliminar(id: number): Promise<{ ok: boolean; msg: string }> {
    const response = await fetch(
      `${API_URL}/api/perfil/usuario/publicaciones/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al eliminar la publicación");
    }

    return data;
  },

  // Obtener mis publicaciones
  async obtenerMisPublicaciones(): Promise<any> {
    const response = await fetch(
      `${API_URL}/api/perfil/usuario/mis-publicaciones`,
      {
        headers: getHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al obtener publicaciones");
    }

    return data;
  },
  // para obtener estadisticas de cant de vistas y compartidas
  async obtenerMisPublicacionesConEstadisticas(): Promise<any> {
    const response = await fetch(`${API_URL}/api/publicaciones/mias`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.msg || "Error al obtener publicaciones",
      );
    }

    const publicaciones = Array.isArray(data.data) ? data.data : [];

    return publicaciones.map((pub: any) => ({
      ...pub,
      totalVisualizaciones: Number(pub.totalVisualizaciones ?? 0),
      totalCompartidos: Number(pub.totalCompartidos ?? 0),
    }));
  },

  async crearPagoPublicidad(
    publicacionId: number,
    planId: number,
    monto: number,
    moneda: string = "USD"
  ): Promise<{ checkoutUrl: string; transaccionId: number }> {
    const response = await fetch(`${API_URL}/api/cobros/crear-pago-publicidad`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        publicacionId,
        planId,
        monto,
        moneda,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al crear el pago");
    }

    return data;
  },

  
  async iniciarPublicidad(publicacionId: number): Promise<{ checkoutUrl: string }> {
    const response = await fetch(`${API_URL}/api/publicaciones/${publicacionId}/publicitar`, {
      method: "POST",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al iniciar publicidad");
    }

    return data.data;
  },

  async confirmarPublicidad(
    publicacionId: number,
    paymentIntentId: string,
    planId?: number
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/publicaciones/${publicacionId}/publicitar/confirmar`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ paymentIntentId, planId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al confirmar publicidad");
    }

    return data;
  },


  async cancelarPublicidad(publicacionId: number): Promise<{ ok: boolean; message: string }> {
    const response = await fetch(`${API_URL}/api/publicaciones/${publicacionId}/publicitar/cancelar`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al cancelar publicidad");
    }

    return data;
  },
  
  async obtenerEstadoPublicidad(publicacionId: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/publicaciones/${publicacionId}/publicitar/estado`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener estado de publicidad");
    }

    return data;
  },
};
