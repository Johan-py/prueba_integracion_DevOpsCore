import { useState, useMemo } from 'react'

interface FilterItem {
  name: string
  count: number
}

export const useFilterLogic = <T extends FilterItem>(
  data: T[],
  globalSortOrder: 'asc' | 'desc'
) => {
  const [viewLevel, setViewLevel] = useState(1)

  const handleSeeMore = () => setViewLevel((prev) => prev + 1)
  const handleSeeLess = () => setViewLevel(1)

  // El ordenamiento ahora depende del "globalSortOrder" que viene del padre
  const visibleData = useMemo(() => {
    if (!data) return []
    const processed = [...data]

    if (globalSortOrder === 'asc') {
      processed.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      processed.sort((a, b) => b.name.localeCompare(a.name))
    }

    if (viewLevel === 1) return processed.slice(0, 2)
    if (viewLevel === 2) return processed.slice(0, 5)
    return processed
  }, [data, globalSortOrder, viewLevel])

  return {
    viewLevel,
    handleSeeMore,
    handleSeeLess,
    visibleData
  }
}
