"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExtrasPropiedad from "@/components/extras-propiedad/ExtrasPropiedad";
import TagsPropiedad from "@/components/extras-propiedad/TagsPropiedad";

type TagBackend = {
  id: number;
  nombre: string;
};

type ParametroBackend = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

type ParametroPublicacion = {
  id: number;
  nombre: string;
};

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Falta NEXT_PUBLIC_API_URL en el entorno");
  }

  return apiUrl;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5efe7] p-8">
          Cargando parámetros...
        </div>
      }
    >
      <ParametrosPageContent />
    </Suspense>
  );
}

function ParametrosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const publicacionIdParam = searchParams.get("publicacionId");
  const publicacionId = publicacionIdParam ? Number(publicacionIdParam) : null;

  // Acepta los dos nombres por seguridad:
  // returnTo viene desde Mis Publicaciones
  // origen puede venir desde Multimedia u otro flujo
  const returnTo = searchParams.get("returnTo");
  const origen = searchParams.get("origen");

  const [catalogoParametros, setCatalogoParametros] = useState<ParametroBackend[]>([]);
  const [parametrosGuardados, setParametrosGuardados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [catalogoTags, setCatalogoTags] = useState<TagBackend[]>([]);
  const [tagsGuardados, setTagsGuardados] = useState<string[]>([]);
  const [mostrarExitoTags, setMostrarExitoTags] = useState(false);

  const volverSegunOrigen = () => {
    const destino = returnTo || origen;

    if (destino === "mis-publicaciones") {
      router.push("/mis-publicaciones");
      return;
    }

    if (destino === "multimedia" && publicacionId && !Number.isNaN(publicacionId)) {
      router.push(`/contenido-multimedia?publicacionId=${publicacionId}`);
      return;
    }

    if (publicacionId && !Number.isNaN(publicacionId)) {
      router.push(`/contenido-multimedia?publicacionId=${publicacionId}`);
      return;
    }

    router.push("/mis-publicaciones");
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (!publicacionId || Number.isNaN(publicacionId)) {
        setMensaje("No se recibió un ID válido de la publicación.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setMensaje("");

        const [catalogoRes, publicacionRes, tagsRes, tagsPubRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/parametros`),
          fetch(`${getApiUrl()}/api/publicaciones/${publicacionId}/parametros`),
          fetch(`${getApiUrl()}/api/tags`),
          fetch(`${getApiUrl()}/api/tags/publicaciones/${publicacionId}`),
        ]);

        const catalogoJson = await catalogoRes.json().catch(() => null);
        const publicacionJson = await publicacionRes.json().catch(() => null);
        const tagsJson = await tagsRes.json().catch(() => null);
        const tagsPubJson = await tagsPubRes.json().catch(() => null);

        if (!catalogoRes.ok) {
          throw new Error(catalogoJson?.message || "No se pudieron obtener los parámetros.");
        }

        if (!publicacionRes.ok) {
          throw new Error(
            publicacionJson?.message || "No se pudieron obtener los parámetros de la publicación."
          );
        }

        const catalogo: ParametroBackend[] = Array.isArray(catalogoJson?.data)
          ? catalogoJson.data
          : [];

        const parametrosPublicacion: ParametroPublicacion[] = Array.isArray(publicacionJson?.data)
          ? publicacionJson.data
              .map((item: any) => ({
                id: item.parametros_personalizados?.id,
                nombre: item.parametros_personalizados?.nombre,
              }))
              .filter((item: ParametroPublicacion) => item.id && item.nombre)
          : [];

        setCatalogoParametros(catalogo);
        setParametrosGuardados(parametrosPublicacion.map((item) => item.nombre));

        const catalogoTagsData: TagBackend[] = Array.isArray(tagsJson?.data)
          ? tagsJson.data : [];
        const tagsPubData: string[] = Array.isArray(tagsPubJson?.data)
          ? tagsPubJson.data.map((item: any) => item.tag?.nombre).filter(Boolean)
          : [];

        setCatalogoTags(catalogoTagsData);
        setTagsGuardados(tagsPubData);
      } catch (error) {
        const mensajeError =
          error instanceof Error ? error.message : "Error al cargar parámetros.";
        setMensaje(mensajeError);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [publicacionId]);

  const manejarGuardarTags = async (tags: string[]) => {
    if (!publicacionId || Number.isNaN(publicacionId)) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró la sesión del usuario.");

      const response = await fetch(
        `${getApiUrl()}/api/tags/publicaciones/${publicacionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags }),
        }
      );

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.mensaje || "No se pudieron guardar los tags.");
      setTagsGuardados(tags);
      setMostrarExitoTags(true);
      setTimeout(() => setMostrarExitoTags(false), 5000);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Error al guardar tags.");
    }
  };
  
  const crearParametroSiNoExiste = async (nombre: string, token: string) => {
    const existente = catalogoParametros.find(
      (item) => item.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
    );

    if (existente) return existente;

    const response = await fetch(`${getApiUrl()}/api/parametros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        descripcion: `Parámetro personalizado: ${nombre}`,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.mensaje || data?.message || `No se pudo crear el parámetro "${nombre}".`
      );
    }

    const creado: ParametroBackend = data?.data;

    if (!creado?.id) {
      throw new Error(`No se recibió el ID del parámetro "${nombre}".`);
    }

    setCatalogoParametros((prev) => [...prev, creado]);
    return creado;
  };

  const manejarGuardarParametros = async (parametros: string[]) => {
    if (!publicacionId || Number.isNaN(publicacionId)) {
      setMensaje("No se recibió un ID válido de la publicación.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró la sesión del usuario.");
      }

      const parametrosConId: Array<{ parametroId: number; valor: null }> = [];

      for (const nombre of parametros) {
        const parametro = await crearParametroSiNoExiste(nombre, token);

        parametrosConId.push({
          parametroId: parametro.id,
          valor: null,
        });
      }

      const response = await fetch(
        `${getApiUrl()}/api/publicaciones/${publicacionId}/parametros`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            parametros: parametrosConId,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.mensaje || data?.message || "No se pudieron guardar los parámetros."
        );
      }

      setParametrosGuardados(parametros);
      setMostrarModalExito(true);

      setTimeout(() => {
        setMostrarModalExito(false);
        volverSegunOrigen();
      }, 1500);
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : "Ocurrió un error al guardar.";
      setMensaje(mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5efe7] p-8 relative">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Tags y Parámetros
        </h1>

        <p className="mb-6 text-gray-600">
          Agrega tags para mejorar la búsqueda de tu inmueble, y parámetros personalizados para destacar sus características únicas.
        </p>

        {mensaje && (
          <p className="mb-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {mensaje}
          </p>
        )}

        {cargando ? (
          <p className="text-gray-600">Cargando parámetros...</p>
        ) : (
          <>
            {publicacionId && (
              <div className="mb-8">
                <TagsPropiedad
                  publicacionId={publicacionId}
                  tagsIniciales={tagsGuardados}
                  catalogoTags={catalogoTags}
                  onGuardar={manejarGuardarTags}
                />
                {mostrarExitoTags && (
                  <p className="mt-2 text-sm font-medium text-green-600">
                    ✓ Tags guardados correctamente
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-[#EAECF0] pt-8">
              <ExtrasPropiedad
                valoresIniciales={parametrosGuardados}
                catalogoParametros={catalogoParametros}
                onGuardar={manejarGuardarParametros}
                onCancelar={volverSegunOrigen}
              />
            </div>
          </>
        )}

        {guardando && !mostrarModalExito && (
          <p className="mt-4 text-sm text-gray-600">Guardando parámetros...</p>
        )}
      </div>

      {mostrarModalExito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white px-8 py-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-5xl font-bold text-white">
              ✓
            </div>
            <p className="text-xl font-bold text-[#1f1f1f]">
              Parámetros personalizados guardados con éxito!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}