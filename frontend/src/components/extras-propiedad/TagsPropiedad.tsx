"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: number;
  nombre: string;
};

type Props = {
  publicacionId: number;
  tagsIniciales?: string[];
  catalogoTags?: Tag[];
  onGuardar?: (tags: string[]) => void;
};

const MIN_CARACTERES = 3;
const MAX_CARACTERES = 30;
const MAX_TAGS = 15;

const SUGERENCIAS_DEFAULT = [
  "piscina", "garaje", "terraza", "pet friendly",
  "amoblado", "vista panorámica", "seguridad 24/7", "jardín",
];

export default function TagsPropiedad({
  tagsIniciales = [],
  catalogoTags = [],
  onGuardar,
}: Props) {
  const [tags, setTags] = useState<string[]>(tagsIniciales);
  const [nuevoTag, setNuevoTag] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<Tag[]>([]);

    useEffect(() => {
    if (tagsIniciales.length > 0) {
        setTags(tagsIniciales);
    }
    }, []);

  useEffect(() => {
    const busqueda = nuevoTag.trim().toLowerCase();
    if (!busqueda) {
      setSugerenciasFiltradas([]);
      return;
    }
    const filtradas = catalogoTags
      .filter((t) => t.nombre.toLowerCase().includes(busqueda))
      .filter((t) => !tags.some((tag) => tag.toLowerCase() === t.nombre.toLowerCase()))
      .slice(0, 6);
    setSugerenciasFiltradas(filtradas);
  }, [nuevoTag, catalogoTags, tags]);

  const agregarTag = (nombre: string) => {
    const valor = nombre.trim();

    if (!valor) return;

    if (valor.length < MIN_CARACTERES || valor.length > MAX_CARACTERES) {
      setError(`El tag debe tener entre ${MIN_CARACTERES} y ${MAX_CARACTERES} caracteres`);
      return;
    }

    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s\-]+$/.test(valor)) {
      setError("El tag contiene caracteres no permitidos");
      return;
    }

    if (tags.some((t) => t.toLowerCase() === valor.toLowerCase())) {
      setError("Este tag ya fue agregado");
      return;
    }

    if (tags.length >= MAX_TAGS) {
      setError(`No puedes agregar más de ${MAX_TAGS} tags`);
      return;
    }

    const nuevos =  [...new Set([...tags, valor])];
    setTags(nuevos);
    setNuevoTag("");
    setError("");
    setMensajeExito("¡Excelente! El tag fue agregado.");
    //onGuardar?.(nuevos);

    setTimeout(() => setMensajeExito(""), 2000);
  };

  const eliminarTag = (index: number) => {
    const actualizados = tags.filter((_, i) => i !== index);
    setTags(actualizados);
    setError("");
    setMensajeExito("");
    //onGuardar?.(actualizados);
  };

    return (
    <div className="mt-4 rounded-2xl border border-neutral-300 bg-[#f5ede2] p-6">
        {/* TITULO */}
        <h3 className="mb-4 text-xl font-bold text-neutral-900">
        Tags o Etiquetas
        </h3>

        <p className="mb-4 text-sm text-neutral-600">
        Agrega palabras clave para que los clientes encuentren tu inmueble
        más fácilmente. Presiona Enter o haz clic en "+ Agregar".
        </p>

        {/* INPUT */}
        <label className="mb-2 block text-sm font-semibold text-neutral-800">
        Nuevo tag:
        </label>

        <div className="relative mb-3 flex flex-col gap-3 md:flex-row">
        <div className="relative w-full">
            <input
            type="text"
            value={nuevoTag}
            maxLength={MAX_CARACTERES}
            onChange={(e) => {
                setNuevoTag(e.target.value);
                if (error) setError("");
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                e.preventDefault();
                agregarTag(nuevoTag);
                }
            }}
            placeholder="Ej: piscina, garaje, terraza"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-orange-400"
            />

            <p className="mt-1 text-xs text-neutral-500">
            {nuevoTag.length}/{MAX_CARACTERES} caracteres
            </p>

            {/* SUGERENCIAS DINÁMICAS */}
            {sugerenciasFiltradas.length > 0 && (
            <div className="absolute left-0 right-0 top-[52px] z-20 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
                {sugerenciasFiltradas.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    onClick={() => agregarTag(t.nombre)}
                    className="block w-full px-4 py-3 text-left text-sm text-neutral-800 hover:bg-orange-50"
                >
                    <span className="font-semibold">{t.nombre}</span>
                </button>
                ))}
            </div>
            )}

            {sugerenciasFiltradas.length === 0 && nuevoTag.trim().length >= 2 && (
            <p className="mt-1 text-xs text-neutral-500">Sin sugerencias</p>
            )}
        </div>

        <button
            type="button"
            onClick={() => agregarTag(nuevoTag)}
            disabled={tags.length >= MAX_TAGS}
            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
            + Agregar
        </button>
        </div>

        {/* ERROR */}
        {error && (
        <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
        )}

        {/* ÉXITO */}
        {mensajeExito && (
        <p className="mb-4 text-sm font-medium text-green-600">{mensajeExito}</p>
        )}

        {/* SUGERENCIAS PREDEFINIDAS */}
        <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-neutral-800">Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
            {SUGERENCIAS_DEFAULT.filter(
            (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
            ).map((item) => (
            <button
                key={item}
                type="button"
                onClick={() => agregarTag(item)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-700 hover:border-orange-400 hover:text-orange-500"
            >
                {item}
            </button>
            ))}
        </div>
        </div>

        {/* TAGS AÑADIDOS */}
        <h4 className="mb-3 text-base font-semibold text-neutral-900">
        Tags añadidos ({tags.length}/{MAX_TAGS}):
        </h4>

        <div className="mb-6 flex flex-wrap gap-3">
        {tags.length === 0 ? (
            <p className="text-sm text-neutral-600">Aún no se añadieron tags.</p>
        ) : (
            tags.map((tag, index) => (
            <div
                key={`${tag}-${index}`}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white"
            >
                <span>{tag}</span>
                <button
                type="button"
                onClick={() => eliminarTag(index)}
                className="text-orange-400"
                title="Eliminar"
                >
                ✖
                </button>
            </div>
            ))
        )}
        </div>

        <p className="mb-4 text-xs text-neutral-500">
        Puedes agregar hasta {MAX_TAGS} tags. Cada tag debe tener entre {MIN_CARACTERES} y {MAX_CARACTERES} caracteres.
        </p>

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-center border-t border-neutral-400 pt-6">
        <button
            type="button"
            disabled={tags.length === 0}
            onClick={() => onGuardar?.(tags)}
            className="rounded-full bg-orange-500 px-8 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
            Guardar tags
        </button>
        </div>
    </div>
    );
}