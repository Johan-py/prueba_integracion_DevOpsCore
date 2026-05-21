"use client";

import { BlogCategory } from "@/types/publicBlog";
import { getCategoryColor } from "@/utils/blogColors";

type BlogFilterChipsProps = {
  categories: readonly BlogCategory[];
  activeCategory: BlogCategory | null;
  onToggleCategory: (category: BlogCategory | null) => void;
};

const chipBase =
  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer";

const chipActive =
  "bg-stone-900 text-white border-stone-900 shadow-sm dark:bg-amber-600 dark:border-amber-600 dark:text-white";

const chipInactive =
  "bg-white text-stone-700 border-stone-300 hover:border-stone-400 dark:bg-transparent dark:text-stone-300 dark:border-stone-500 dark:hover:border-stone-400";

export default function BlogFilterChips({
  categories,
  activeCategory,
  onToggleCategory,
}: BlogFilterChipsProps) {
  return (
    <div className="blog-filter-chips flex flex-wrap gap-2 sm:flex-wrap sm:overflow-x-visible">
      <button
        type="button"
        onClick={() => onToggleCategory(null)}
        aria-pressed={activeCategory === null}
        className={`${chipBase} ${activeCategory === null ? chipActive : chipInactive}`}
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
            className={`${chipBase} ${isActive ? chipActive : `${chipInactive} ${color.hoverBorder}`}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
