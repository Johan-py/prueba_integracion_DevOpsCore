"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, MapPin } from "lucide-react";

type Inmueble = {
  id: number;
  titulo: string;
  precio: number;
  descripcion?: string;
  nroCuartos?: number;
  nroBanos?: number;
  ubicacion?: {
    ciudad?: string;
    direccion?: string;
    zona?: string;
  };
  imagen_principal?: string;
  publicaciones?: Array<{
    multimedia?: Array<{
      url: string;
      tipo: string;
    }>;
  }>;
};

type FavoritoItem = {
  id: number;
  agregadoEn: string;
  inmueble: Inmueble;
};

type FavoritesResponse = {
  total: number;
  page: number;
  per_page: number;
  totalPages: number;
  data: FavoritoItem[];
};

export default function MisFavoritos() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
  open: boolean;
  inmuebleId: number | null;
    }>({
  open: false,
  inmuebleId: null,
});

  const fetchFavoritos = async (pageNum: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites?page=${pageNum}&per_page=9`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("No autorizado - token inválido");
          localStorage.removeItem("token");
        }
        throw new Error(`Error ${response.status}`);
      }

      const data: FavoritesResponse = await response.json();
      console.log("Favoritos recibidos:", data);

      setFavoritos(data.data || []);
      setTotal(data.total);
      setTotalPages(data.totalPages || Math.ceil(data.total / data.per_page));
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (inmuebleId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setRemovingId(inmuebleId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${inmuebleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchFavoritos(page);
      } else {
        console.error("Error al eliminar favorito");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const confirmRemove = async () => {
  if (confirmModal.inmuebleId !== null) {
    await removeFavorite(confirmModal.inmuebleId);
    setConfirmModal({ open: false, inmuebleId: null });
  }
 };

  const getImagenUrl = (inmueble: Inmueble): string => {
    // Usar el nuevo campo imagen_principal
    if (inmueble.imagen_principal) {
      const url = inmueble.imagen_principal;
      if (url.startsWith("/uploads") || url.startsWith("/images")) {
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
      }
      return url;
    }
    return "https://via.placeholder.com/400x300?text=Sin+imagen";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const verDetalle = (inmuebleId: number) => {
    router.push(`/detalle-propiedad/${inmuebleId}`);
  };
  useEffect(() => {
    fetchFavoritos(page);
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87B00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Gestión de Favoritos
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            {total === 0
              ? "Aún no tienes propiedades favoritas"
              : `${total} propiedad${total !== 1 ? "es" : ""} encontrada${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* CONTENIDO */}
        {favoritos.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-400 text-sm">
              Explora nuestras propiedades favoritas...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritos.map((fav) => {
                const inmueble = fav.inmueble;
                const imagenUrl = getImagenUrl(inmueble);
                const ciudad = inmueble.ubicacion?.ciudad || "Ubicación no especificada";
                const habitaciones = inmueble.nroCuartos || 0;
                const banos = inmueble.nroBanos || 0;

                return (
                  <div
                    key={fav.id}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* IMAGEN */}
                    <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                      <img
                        src={imagenUrl}
                        alt={inmueble.titulo || "Propiedad"}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* FECHA DE AGREGADO (esquina superior derecha) */}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                        <span className="text-white text-xs flex items-center gap-1">
                          <Star size={10} fill="#E87B00" color="#E87B00" />
                          {formatDate(fav.agregadoEn)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* PRECIO */}
                      <p className="text-[#E87B00] font-bold text-xl">
                        ${new Intl.NumberFormat('en-US').format(inmueble.precio || 0)} USD
                      </p>

                      {/* TÍTULO */}
                      <h3 className="font-bold text-gray-900 text-base mt-1 line-clamp-1">
                        {inmueble.titulo || "Propiedad sin título"}
                      </h3>

                      {/* UBICACIÓN */}
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                           {ciudad}
                      </p>

                      {/* CARACTERÍSTICAS */}
                      {(habitaciones > 0 || banos > 0) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                          {habitaciones > 0 && <span>{habitaciones} hab</span>}
                          {habitaciones > 0 && banos > 0 && <span>•</span>}
                          {banos > 0 && <span>{banos} baños</span>}
                        </div>
                      )}

                      {/* DESCRIPCIÓN CORTA */}
                      {inmueble.descripcion && (
                        <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                          {inmueble.descripcion}
                        </p>
                      )}

                      {/* BOTONES: ESTRELLA + VER DETALLE */}
                      <div className="mt-4 flex gap-2 items-center">
                        {/* Botón estrella para quitar de favoritos */}
                        <button
                          onClick={() => setConfirmModal({ open: true, inmuebleId: inmueble.id })}
                          disabled={removingId === inmueble.id}
                          className="bg-[#E87B00] p-2.5 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[42px] group/star"
                          title="Quitar de favoritos"
                        >
                          <Star
                            size={20}
                            fill="white"
                            color="white"
                            className="transition-transform group-hover/star:scale-110"
                          />
                        </button>

                        {/* Botón Ver Detalle */}
                        <button
                          onClick={() => verDetalle(inmueble.id)}
                          className="flex-1 bg-[#E87B00] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            {totalPages >= 1 && (
              <div className="mt-10 flex justify-center gap-2 pb-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${page === pageNum
                        ? "bg-[#E87B00] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
            {/* MODAL DE CONFIRMACIÓN */}
  {confirmModal.open && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl">
      
      <h2 className="text-lg font-bold text-gray-900">
        ¿Eliminar de favoritos?
      </h2>

      <p className="text-sm text-gray-600 mt-2">
        Esta propiedad se quitará de tu lista de favoritos.
      </p>

      <div className="mt-6 flex gap-3 justify-end">
        {/* Cancelar */}
        <button
          onClick={() =>
            setConfirmModal({ open: false, inmuebleId: null })
          }
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>

        {/* Confirmar */}
        <button
          onClick={confirmRemove}
          className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}