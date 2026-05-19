"use client";

import { BlogCategory } from "@/types/publicBlog";
import { getCategoryColor } from "@/utils/blogColors";

type BlogFilterChipsProps = {
  categories: readonly BlogCategory[];
  activeCategory: BlogCategory | null;
  onToggleCategory: (category: BlogCategory | null) => void;
};

export default function BlogFilterChips({
  categories,
  activeCategory,
  onToggleCategory,
}: BlogFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:flex-wrap sm:overflow-x-visible">
      <button
        type="button"
        onClick={() => onToggleCategory(null)}
        aria-pressed={activeCategory === null}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          activeCategory === null
            ? "bg-stone-900 text-white border-stone-900"
            : "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-200 border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-500"
        }`}
      >
        Todos
      </button>

      {categories.map((category) => {
        const isActive = activeCategory === category;
        const color = getCategoryColor(category);

        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggleCategory(category)}
            aria-pressed={isActive}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-stone-900 text-white border-stone-900"
                : `bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-200 border-stone-300 dark:border-stone-600 ${color.hoverBorder}`
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
