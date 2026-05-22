import { BlogCategory } from "@/types/publicBlog";

/**
 * Retorna clases de Tailwind para los colores de las categorías del blog.
 * Aunque el estado activo sea negro, estos colores se usan para el hover 
 * y podrían usarse para bordes o insignias.
 */
export function getCategoryColor(category: BlogCategory) {
  const categoryMap: Record<string, { bg: string; border: string; hoverBorder: string; hoverText: string }> = {
    "Mercado": {
      bg: "bg-blue-600",
      border: "border-blue-600",
      hoverBorder: "hover:border-blue-500",
      hoverText: "hover:text-blue-600",
    },
    "Inmuebles": {
      bg: "bg-emerald-600",
      border: "border-emerald-600",
      hoverBorder: "hover:border-emerald-500",
      hoverText: "hover:text-emerald-600",
    },
    "Consejos": {
      bg: "bg-amber-600",
      border: "border-amber-600",
      hoverBorder: "hover:border-amber-500",
      hoverText: "hover:text-amber-600",
    },
    "Tendencias": {
      bg: "bg-purple-600",
      border: "border-purple-600",
      hoverBorder: "hover:border-purple-500",
      hoverText: "hover:text-purple-600",
    },
  };

  return categoryMap[category] || {
    bg: "bg-stone-600",
    border: "border-stone-600",
    hoverBorder: "hover:border-stone-400",
    hoverText: "hover:text-stone-600",
  };
}