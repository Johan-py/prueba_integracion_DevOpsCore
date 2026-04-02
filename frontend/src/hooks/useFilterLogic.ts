import { useState, useMemo } from "react";

interface FilterItem {
  name: string;
  count: number;
}

export const useFilterLogic = <T extends FilterItem>(
  data: T[],
  globalSortOrder: "asc" | "desc",
) => {
  const [viewLevel, setViewLevel] = useState(1);

  const handleSeeMore = () => setViewLevel((prev) => prev + 1);
  const handleSeeLess = () => setViewLevel(1);

  // El ordenamiento ahora depende del "globalSortOrder" que viene del padre
  const visibleData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const processed = [...data];

    // Ordenamiento con protección contra valores undefined/null
    processed.sort((a, b) => {
      // Usamos el operador "Nullish coalescing" o un string vacío como backup
      const nameA = a?.name ?? "";
      const nameB = b?.name ?? "";

      return globalSortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    if (viewLevel === 1) return processed.slice(0, 2);
    if (viewLevel === 2) return processed.slice(0, 5);
    return processed;
  }, [data, globalSortOrder, viewLevel]);

  return {
    viewLevel,
    handleSeeMore,
    handleSeeLess,
    visibleData,
  };
};
