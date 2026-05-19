"use client";

import { BookOpen } from "lucide-react";
import { BlogCreationAction } from "@/services/blogs.service";

interface BlogSidebarProps {
  statusLabel?: string;
  isSubmitting: boolean;
  onAction: (accion: BlogCreationAction) => void;
}

export default function BlogSidebar({
  statusLabel,
  isSubmitting,
  onAction
}: BlogSidebarProps) {
  const isPendiente = statusLabel === "PENDIENTE";
  const isRechazado = statusLabel === "RECHAZADO";

  return (
    <aside className="space-y-6 lg:pt-24">
      <div className="rounded-[32px] bg-white dark:bg-[#111] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 dark:ring-white/10 space-y-5">
        <h2 className="text-xl font-bold text-[#1C1917] dark:text-white">Publicación</h2>
        <div className="space-y-3">
          {isPendiente ? (
            <div className="w-full flex h-[56px] items-center justify-center rounded-[20px] bg-amber-100 text-sm font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
              En revisión
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAction("pendiente")}
                disabled={isSubmitting}
                className="w-full flex h-[56px] items-center justify-center rounded-[20px] bg-[#B45309] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#92400E] shadow-lg shadow-amber-900/10 disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : isRechazado ? "Volver a enviar" : "Publicar"}
              </button>
              <button
                type="button"
                onClick={() => onAction("borrador")}
                disabled={isSubmitting || isPendiente}
                className="w-full flex h-[56px] items-center justify-center rounded-[20px] bg-[#E7E5E4] dark:bg-[#222] text-sm font-bold uppercase tracking-wider text-[#44403C] dark:text-white transition hover:bg-[#D6D3D1] dark:hover:bg-[#333] disabled:opacity-50"
              >
                Guardar borrador
              </button>
            </>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-[#78716C] dark:text-[#999]">Estado</span>
          <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-bold ${
            isPendiente ? "bg-amber-100 text-amber-700" :
            isRechazado ? "bg-red-100 text-red-600" :
            statusLabel === "PUBLICADO" ? "bg-green-100 text-green-700" :
            "bg-[#E7E5E4] text-[#44403C] dark:text-[#999]"
          }`}>
            {statusLabel ?? "BORRADOR"}
          </span>
        </div>
      </div>

      <div className="rounded-[32px] bg-[#F5F5F4]/60 dark:bg-[#111] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-[#B45309]" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#999]">Guías de un buen post</h3>
        </div>
        <div className="space-y-6">
          {[
            "Prioriza la claridad sobre la complejidad. Usa encabezados descriptivos.",
            "Asegúrate de que todas las imágenes sean de alta resolución.",
            "Los enlaces deben abrirse en pestañas nuevas y dirigir a fuentes autorizadas.",
          ].map((text, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-xl font-black text-[#B45309] leading-none">0{i + 1}</span>
              <p className="text-xs font-medium leading-relaxed text-[#57534E] dark:text-[#999]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
