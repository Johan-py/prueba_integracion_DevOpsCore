"use client";

import { BlogCategoryOption } from "@/services/blogs.service";

interface BlogInfoFieldsProps {
  titulo: string;
  setTitulo: (val: string) => void;
  categoriaId: string;
  setCategoriaId: (val: string) => void;
  categories: BlogCategoryOption[];
  isLoadingCategories: boolean;
  errors: {
    titulo?: string;
    categoria_id?: string;
  };
}

export default function BlogInfoFields({
  titulo,
  setTitulo,
  categoriaId,
  setCategoriaId,
  categories,
  isLoadingCategories,
  errors
}: BlogInfoFieldsProps) {
  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="space-y-3">
        <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
          Titulo del post
        </span>
        <input
          type="text"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Escribe un título"
          className="w-full rounded-[20px] bg-[#F5F5F4] dark:bg-[#111] px-6 py-5 text-xl font-bold text-[#1C1917] dark:text-white placeholder:text-[#D6D3D1] dark:placeholder:text-[#666] outline-none transition focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F59E0B]/20"
        />
        {errors.titulo && (
          <p className="px-2 text-sm font-medium text-red-500">{errors.titulo}</p>
        )}
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] dark:text-[#999]">
          Categoría
        </span>
        <div className="relative">
          <select
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
            disabled={isLoadingCategories}
            className="w-full appearance-none rounded-2xl bg-[#F5F5F4] dark:bg-[#111] px-6 py-4 text-sm font-semibold text-[#44403C] dark:text-white outline-none transition focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F59E0B]/20 disabled:opacity-50"
          >
            <option value="">
              {isLoadingCategories ? "Cargando..." : "Selecciona una categoría"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.nombre}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-[#A8A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.categoria_id && (
          <p className="px-2 text-sm font-medium text-red-500">{errors.categoria_id}</p>
        )}
      </div>
    </div>
  );
}
