"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import InfoPropiedad from "./InfoPropiedad";
import GaleriaResumen from "./GaleriaResumen";
import AceptacionPublicacion from "./AceptacionPublicacion";
import ParametrosPersonalizados from "./ParametrosPersonalizados";

import PublicarModal from "../publicacion/PublicarModal";
import { EstadoPublicacion } from "../../types/publicacion";

interface Props {
  publicacionId: number | null;
}

type ParametroItem = {
  id: number;
  nombre: string;
};

export interface ResumenFinalData {
  id: number;
  publicacionId: number;
  inmuebleId: number;
  publicacion: {
    titulo: string | null;
    descripcion: string | null;
    estado: string;
    fechaPublicacion: string | null;
  };
  datosGenerales: {
    tipoOperacion: string | null;
    tipoInmueble: string | null;
    direccion: string | null;
    ciudad: string | null;
    zona: string | null;
    precio: number | null;
    areaM2: number | null;
    coordenadas: {
      latitud: number | null;
      longitud: number | null;
    };
  };
  caracteristicas: {
    habitaciones: number | null;
    banos: number | null;
    estacionamiento: number | null;
  };
  parametrosPersonalizados?: ParametroItem[];
  multimedia: {
    total: number;
    imagenes: any[];
    videos: any[];
  };
  soloLectura: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
}

function normalizarParametros(data: any): ParametroItem[] {
  if (!data) return [];

  const lista =
    Array.isArray(data)
      ? data
      : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.parametros)
          ? data.parametros
          : Array.isArray(data.parametrosPersonalizados)
            ? data.parametrosPersonalizados
            : [];

  return lista
    .map((item: any) => {
      const id =
        item.parametros_personalizados?.id ??
        item.parametro?.id ??
        item.parametroPersonalizado?.id ??
        item.parametro_id ??
        item.parametroId ??
        item.id;

      const nombre =
        item.parametros_personalizados?.nombre ??
        item.parametro?.nombre ??
        item.parametroPersonalizado?.nombre ??
        item.nombre ??
        item.nombreParametro ??
        "";

      return {
        id: Number(id),
        nombre: String(nombre),
      };
    })
    .filter((item: ParametroItem) => item.nombre.trim() !== "");
}

export default function ResumenPanel({ publicacionId }: Props) {
  const router = useRouter();
  const [aceptado, setAceptado] = useState(false);
  const [data, setData] = useState<ResumenFinalData | null>(null);
  const [parametrosExtra, setParametrosExtra] = useState<ParametroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [estadoPublicacion, setEstadoPublicacion] =
    useState<EstadoPublicacion>("idle");
  const [progreso, setProgreso] = useState(0);

  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const isCancelled = useRef(false);
  const isPaused = useRef(false);

  // ================= FETCH RESUMEN + PARAMETROS =================
  useEffect(() => {
    if (!publicacionId) {
      setError("No se recibió el id");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const resResumen = await fetch(
          `${API_BASE_URL}/api/publicaciones/${publicacionId}/resumen-final`,
          {
            headers,
          }
        );

        const jsonResumen = await resResumen.json();

        if (!resResumen.ok) {
          throw new Error(
            jsonResumen?.message ||
              jsonResumen?.mensaje ||
              "Error cargando el resumen final"
          );
        }

        const resumen = jsonResumen.data;
        setData(resumen);

        const parametrosDesdeResumen = normalizarParametros(
          resumen?.parametrosPersonalizados
        );

        if (parametrosDesdeResumen.length > 0) {
          setParametrosExtra(parametrosDesdeResumen);

          console.log(
            "✅ Parámetros personalizados recuperados desde resumen:",
            parametrosDesdeResumen
          );
        } else {
          const resParametros = await fetch(
            `${API_BASE_URL}/api/publicaciones/${publicacionId}/parametros`,
            {
              headers,
            }
          );

          if (resParametros.ok) {
            const jsonParametros = await resParametros.json();
            const parametrosNormalizados = normalizarParametros(jsonParametros);

            setParametrosExtra(parametrosNormalizados);

            console.log(
              "✅ Parámetros personalizados recuperados desde endpoint:",
              parametrosNormalizados
            );
          } else {
            console.warn(
              "⚠️ No se pudieron recuperar los parámetros personalizados"
            );
            setParametrosExtra([]);
          }
        }
      } catch (err) {
        console.error("Error cargando datos del resumen:", err);
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicacionId]);

  // ================= LOGICA PARAMETROS =================
  const parametrosFinales = useMemo(() => {
    const parametrosDesdeResumen = normalizarParametros(
      data?.parametrosPersonalizados
    );

    if (parametrosDesdeResumen.length > 0) {
      return parametrosDesdeResumen;
    }

    return parametrosExtra;
  }, [data, parametrosExtra]);

  const ejecutarPublicacion = async () => {
    if (!aceptado) return;

    isCancelled.current = false;
    isPaused.current = false;
    setEstadoPublicacion("publicando");
    setProgreso(0);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProgreso(50);

      await new Promise((r) => setTimeout(r, 500));
      setProgreso(100);

      setEstadoPublicacion("exito");
      setMostrarModalExito(true);
    } catch {
      setEstadoPublicacion("error_publicacion");
    }
  };

  const handleCancelar = () => {
    isCancelled.current = true;
    setEstadoPublicacion("idle");
    router.push("/");
  };

  const handlePausar = (p: boolean) => {
    isPaused.current = p;
  };

  const cerrarModalExito = () => setMostrarModalExito(false);
  const irAlHome = () => router.push("/");

  // ================= UI =================
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl bg-white p-6 rounded-2xl">
        <p className="text-gray-600">Cargando...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl bg-white p-6 rounded-2xl">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!data) return null;

  return (
    <>
      <section className="mx-auto max-w-7xl bg-white p-6 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">
          Resumen de la propiedad
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <InfoPropiedad data={data} />
          <GaleriaResumen multimedia={data.multimedia} />
        </div>

        <div className="mt-6">
          <ParametrosPersonalizados parametros={parametrosFinales} />
        </div>

        <div className="mt-6 flex justify-center">
          <AceptacionPublicacion
            aceptado={aceptado}
            setAceptado={setAceptado}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-12 rounded-xl border border-gray-400 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Volver
          </button>

          <button
            type="button"
            disabled={!aceptado}
            onClick={ejecutarPublicacion}
            className={`w-full h-12 rounded-xl font-bold transition ${
              aceptado
                ? "bg-orange-400 text-white hover:bg-orange-500 cursor-pointer"
                : "bg-orange-300 text-white opacity-70 cursor-not-allowed"
            }`}
          >
            Confirmar y Publicar
          </button>
        </div>
      </section>

      {/* Modal publicación */}
      {estadoPublicacion !== "idle" && (
        <PublicarModal
          estado={estadoPublicacion as any}
          progreso={progreso}
          onConfirmar={ejecutarPublicacion}
          onCancelar={handleCancelar}
          onReintentar={() => setEstadoPublicacion("confirmando")}
          onPausar={handlePausar}
        />
      )}

      {/* Modal éxito */}
      {mostrarModalExito && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl text-center shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Publicado con éxito
            </h2>

            <p className="text-gray-600 mb-6">
              La publicación fue registrada correctamente.
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={irAlHome}
                className="w-full h-11 rounded-xl bg-orange-400 text-white font-bold hover:bg-orange-500 transition"
              >
                Ir al inicio
              </button>

              <button
                type="button"
                onClick={cerrarModalExito}
                className="w-full h-11 rounded-xl border border-gray-400 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}