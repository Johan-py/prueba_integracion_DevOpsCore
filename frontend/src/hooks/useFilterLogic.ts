import { useState, useMemo } from 'react'

interface FilterItem {
  name: string
  count: number
}

export const useFilterLogic = <T extends FilterItem>(
  data: T[],
<<<<<<< HEAD
  globalSortOrder: 'asc' | 'desc'
=======
  globalSortOrder: 'asc' | 'desc',
  sortBy: 'name' | 'count'
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
) => {
  const [viewLevel, setViewLevel] = useState(1)

  const handleSeeMore = () => setViewLevel((prev) => prev + 1)
  const handleSeeLess = () => setViewLevel(1)

  const visibleData = useMemo(() => {
<<<<<<< HEAD
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
=======
    if (!data || !Array.isArray(data)) return []
    const processed = [...data]

    processed.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a?.name ?? ''
        const nameB = b?.name ?? ''
        return globalSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else {
        // Ordenar por Cantidad (count)
        return globalSortOrder === 'asc' ? a.count - b.count : b.count - a.count
      }
    })

    if (viewLevel === 1) return processed.slice(0, 3)
    if (viewLevel === 2) return processed.slice(0, 6)
    return processed
  }, [data, globalSortOrder, viewLevel, sortBy])
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5

  return {
    viewLevel,
    handleSeeMore,
    handleSeeLess,
    visibleData
  }
}
