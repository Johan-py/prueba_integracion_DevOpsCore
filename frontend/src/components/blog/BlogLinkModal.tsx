"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, X, ChevronRight, ChevronLeft, CheckCircle2, Type, Globe } from "lucide-react";

interface BlogLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text?: string) => void;
  initialText?: string;
}

export default function BlogLinkModal({
  isOpen,
  onClose,
  onConfirm,
  initialText = "",
}: BlogLinkModalProps) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setText(initialText);
      setUrl("");
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim(), text.trim() || url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="w-full max-w-[440px] bg-white dark:bg-[#111] rounded-[40px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress */}
        <div className="px-10 pt-10 pb-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center rotate-3">
                <LinkIcon className="h-5 w-5 text-[#B45309]" />
              </div>
              <h3 className="text-xl font-black text-[#1C1917] dark:text-white tracking-tight">Nuevo Enlace</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#A8A29E] hover:text-[#44403C] hover:bg-[#F5F5F4] rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Visual */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-[#B45309]" : "bg-[#F5F5F4]"
                  }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10">
          <div className="relative min-h-[220px] overflow-hidden">
            {/* Step 1: Text */}
            <div className={`transition-all duration-500 absolute inset-0 ${step === 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
              }`}>
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-amber-600">
                  <Type className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Paso 1: Identificación</span>
                </div>
                <h4 className="text-2xl font-bold text-[#1C1917] dark:text-white leading-tight">¿Qué texto verán tus lectores?</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ej: Ver catálogo completo"
                    className="w-full rounded-2xl bg-[#F5F5F4] dark:bg-[#222] px-6 py-5 text-base font-semibold text-[#1C1917] dark:text-white outline-none transition focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#F59E0B]/10 border-2 border-transparent focus:border-[#F59E0B]/20"
                    autoFocus
                  />
                  <p className="text-xs text-[#78716C] dark:text-[#999] leading-relaxed px-1">
                    Este es el texto amigable que aparecerá resaltado en tu blog.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: URL */}
            <div className={`transition-all duration-500 absolute inset-0 ${step === 2 ? "translate-x-0 opacity-100" : step < 2 ? "translate-x-full opacity-0" : "-translate-x-full opacity-0 pointer-events-none"
              }`}>
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-amber-600">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Paso 2: Dirección</span>
                </div>
                <h4 className="text-2xl font-bold text-[#1C1917] dark:text-white leading-tight">¿A dónde los enviamos?</h4>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tu-sitio.com/pagina"
                    className="w-full rounded-2xl bg-[#F5F5F4] dark:bg-[#222] px-6 py-5 text-base font-semibold text-[#1C1917] dark:text-white outline-none transition focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#F59E0B]/10 border-2 border-transparent focus:border-[#F59E0B]/20"
                    required={step === 2}
                  />
                  <p className="text-xs text-[#78716C] dark:text-[#999] leading-relaxed px-1">
                    Pega la dirección web completa (URL) del destino.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Result */}
            <div className={`transition-all duration-500 absolute inset-0 ${step === 3 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
              }`}>
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Paso 3: Confirmación</span>
                </div>
                <h4 className="text-2xl font-bold text-[#1C1917] dark:text-white leading-tight">¡Todo listo para brillar!</h4>
                <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-emerald-600/60 tracking-wider">Vista previa final</span>
                    <p className="text-lg font-bold text-[#B45309] underline underline-offset-4 break-all">
                      {text.trim() || url.trim() || "mi-enlace"}
                    </p>
                  </div>
                  <div className="h-px bg-emerald-100 w-full" />
                  <p className="text-xs text-emerald-700/70 font-medium">
                    Haz clic en "Finalizar" para insertar el enlace en tu artículo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-10">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[#F5F5F4] dark:bg-[#222] text-[#1C1917] dark:text-white transition hover:bg-[#E7E5E4] dark:hover:bg-[#333]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !text.trim() && !url.trim() && step === 1} // Optional validation
                className="flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl bg-[#B45309] text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#92400E] shadow-xl shadow-amber-900/20 active:scale-95"
              >
                Continuar
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!url.trim()}
                className="flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl bg-[#059669] text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#047857] shadow-xl shadow-emerald-900/20 active:scale-95"
              >
                Finalizar
                <CheckCircle2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
