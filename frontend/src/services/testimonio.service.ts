const getApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
  return token;
};

export type Testimonio = {
  id: number;
  comentario: string;
  calificacion: number | null;
  ciudad: string | null;
  zona: string | null;
  categoria: string | null;
  fecha_creacion: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    avatar: string | null;
    iniciales: string;
  };
  totalLikes: number;
  meGusta: boolean;
};

export type TestimoniosResponse = {
  data: Testimonio[];
};

// GET /api/testimonios?ciudad=Cochabamba
export const getTestimonios = async (
  ciudad?: string
): Promise<Testimonio[]> => {
  const apiUrl = getApiUrl();
  const params = new URLSearchParams();
  if (ciudad && ciudad !== "Todos") params.set("ciudad", ciudad);

  try {
    // Intentar con token si el usuario está autenticado (para saber si ya dio like)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(
      `${apiUrl}/api/testimonios?${params.toString()}`,
      {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const result: TestimoniosResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error al obtener testimonios:", error);
    return [];
  }
};

// POST /api/testimonios/:id/like  (toggle)
export const toggleLikeTestimonio = async (
  id: number
): Promise<{ meGusta: boolean; totalLikes: number }> => {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/api/testimonios/${id}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo registrar el like");
  }

  return data;
};