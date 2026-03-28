import { useState } from 'react';

// Definimos qué estructura mínima esperamos de los datos
interface FilterItem {
  name: string;
  count: number;
}

export const useFilterLogic = <T extends FilterItem>(initialData: T[]) => {
  const [viewLevel, setViewLevel] = useState(1); 
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  // Rota entre: none -> asc -> desc -> none
  const toggleSort = () => {
    setSortOrder(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };
};