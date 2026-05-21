"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { AccessibilityOption } from "@/hooks/useAccessibility";

type ThemeOption = "light" | "dark";

type ThemeCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  preview: "light" | "dark";
};

type AccessibilityCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  colors: string[];
  icon: string;
};

function MiniBrowserPreview({ mode }: { mode: "light" | "dark" }) {
  const isDark = mode === "dark";
  return (
    <div
      className={`visual-option-preview w-full overflow-hidden rounded-xl border ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-2 ${
          isDark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div
          className={`ml-2 h-2 w-24 rounded-full ${
            isDark ? "bg-gray-600" : "bg-gray-300"
          }`}
        />
      </div>
      <div className="space-y-2 p-4">
        <div
          className={`h-3 w-3/4 rounded-full ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-2 w-full rounded-full ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        />
        <div
          className={`h-2 w-5/6 rounded-full ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-16 rounded-lg bg-orange-400" />
          <div
            className={`h-6 w-16 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ title, description, selected, onClick, preview }: ThemeCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex flex-col gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-orange-500 bg-orange-50/60"
          : "border-gray-200 bg-white hover:border-orange-200"
      }`}
    >
      <MiniBrowserPreview mode={preview} />
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected
              ? "border-orange-500 bg-orange-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-0.5 text-sm leading-5 text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

function AccessibilityCard({
  title,
  description,
  selected,
  onClick,
  colors,
  icon,
}: AccessibilityCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex flex-col gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-orange-500 bg-orange-50/60"
          : "border-gray-200 bg-white hover:border-orange-200"
      }`}
    >
      <div className="visual-option-preview flex h-24 items-center justify-center rounded-xl bg-gray-50">
        {colors.length > 0 ? (
          <div className="flex gap-2">
            {colors.map((c, i) => (
              <span
                key={i}
                className="h-10 w-10 rounded-full shadow-sm ring-2 ring-white"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          <span className="text-4xl">{icon}</span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected
              ? "border-orange-500 bg-orange-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-0.5 text-sm leading-5 text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function AjustesVisualizacion() {
  const { resolvedTheme, setTheme } = useTheme();
  const { accessibility, setAccessibility } = useAccessibility();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme: ThemeOption =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const ACCESSIBILITY_OPTIONS: {
    value: AccessibilityOption;
    title: string;
    description: string;
    colors: string[];
    icon: string;
  }[] = [
    {
      value: "none",
      title: "Sin filtro",
      description: "Colores por defecto.",
      colors: [],
      icon: "👁️",
    },
    {
      value: "deuteranopia",
      title: "Deuteranopia",
      description: "Dificultad para ver el verde.",
      colors: ["#d4a843", "#4a90d9", "#8b8b8b"],
      icon: "",
    },
    {
      value: "protanopia",
      title: "Protanopia",
      description: "Dificultad para ver el rojo.",
      colors: ["#c8a200", "#5b9bd5", "#9a9a9a"],
      icon: "",
    },
    {
      value: "tritanopia",
      title: "Tritanopia",
      description: "Dificultad para ver el azul.",
      colors: ["#e05c5c", "#4db891", "#c0c0c0"],
      icon: "",
    },
  ];

  return (
    <main className="propbol-visual-settings-page min-h-screen bg-[#f8f6f1] px-4 py-8 text-gray-900">
      <section className="mx-auto w-full max-w-3xl space-y-6">

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Ajustes de Visualización
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Personaliza cómo se ve la plataforma para que tengas una experiencia
            más cómoda e inclusiva.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Modo de apariencia
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Elige el tema visual que prefieras.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ThemeCard
              title="Modo claro"
              description="Interfaz con fondo claro ideal para ambientes bien iluminados."
              preview="light"
              selected={currentTheme === "light"}
              onClick={() => setTheme("light")}
            />
            <ThemeCard
              title="Modo oscuro"
              description="Interfaz con fondo oscuro ideal para ambientes con poca luz."
              preview="dark"
              selected={currentTheme === "dark"}
              onClick={() => setTheme("dark")}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Accesibilidad – Daltonismo
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Aplica un filtro de color para mejorar la experiencia visual según
              tu tipo de daltonismo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ACCESSIBILITY_OPTIONS.map((opt) => (
              <AccessibilityCard
                key={opt.value}
                title={opt.title}
                description={opt.description}
                colors={opt.colors}
                icon={opt.icon}
                selected={accessibility === opt.value}
                onClick={() => setAccessibility(opt.value)}
              />
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}