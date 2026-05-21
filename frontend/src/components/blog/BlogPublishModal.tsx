"use client";

import { Mail } from "lucide-react";

type BlogPublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export default function BlogPublishModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: BlogPublishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Contenido del Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-white dark:bg-[#111] shadow-2xl transition-all">
        {/* Fondo decorativo con degradado sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.05),transparent_70%)]" />

        <div className="relative flex flex-col items-center px-8 py-12 text-center sm:px-12">
          {/* Icono decorativo */}
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50 dark:bg-[#222]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.1)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-[#111] shadow-sm">
              <Mail className="h-8 w-8 text-[#a56400] dark:text-[#a56400]" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-white" />
            </div>
          </div>

          {/* Textos */}
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Enviar para Publicación
          </h2>
          <p className="mb-10 text-base leading-relaxed text-stone-600 dark:text-[#999]">
            Tu artículo será revisado por el administrador para su publicación y puedes revisar el estado en el apartado de blogs.
          </p>

          {/* Botones */}
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[52px] rounded-full border border-stone-200 dark:border-[#333] px-10 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-[#999] transition-all hover:bg-stone-50 dark:hover:bg-[#222] disabled:opacity-50"
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="group relative min-h-[52px] overflow-hidden rounded-full bg-[#D97706] px-10 text-xs font-bold uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(217,119,6,0.5)] transition-all hover:bg-[#a56400] hover:shadow-[0_15px_40px_-10px_rgba(217,119,6,0.6)] disabled:opacity-50"
            >
              <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
                ENVIAR A REVISIÓN
              </span>
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
