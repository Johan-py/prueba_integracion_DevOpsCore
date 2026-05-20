import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  isCompareMode: boolean
  selectedIds: string[]
  toggleCompareMode: () => void
  toggleProperty: (id: string) => void
  removeProperty: (id: string) => void
  clearSelection: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      isCompareMode: false,
      selectedIds: [],
      toggleCompareMode: () => set((state) => {
        const newMode = !state.isCompareMode;
        // Al salir del modo, opcionalmente vaciamos la selección
        return { isCompareMode: newMode, selectedIds: newMode ? state.selectedIds : [] };
      }),
      toggleProperty: (id) => {
        const { selectedIds } = get();
        const isSelected = selectedIds.includes(id);

        if (!isSelected && selectedIds.length >= 4) {
          // Aquí puedes disparar un toast de tu sistema
          alert('El límite máximo es de 4 propiedades'); 
          return;
        }

        set({
          selectedIds: isSelected
            ? selectedIds.filter((selectedId) => selectedId !== id)
            : [...selectedIds, id],
        });
      },
      removeProperty: (id) => set((state) => ({
        selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
      })),
      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      name: 'propbol-compare-storage',
      // FIX: Ahora persistimos tanto los IDs como el estado visual del modo comparar
      partialize: (state) => ({ 
        selectedIds: state.selectedIds,
        isCompareMode: state.isCompareMode 
      }), 
    }
  )
)