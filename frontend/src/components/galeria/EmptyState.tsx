import { SearchX } from 'lucide-react'

export default function EmptyState() {
  return (
    // Se quitó "h-full" y se agregó "py-16"
    <div className="flex flex-col items-center justify-center py-16 text-center px-8 bg-white/50 rounded-xl border border-dashed border-gray-300 mx-4 my-8">
      <div className="bg-orange-100 p-4 rounded-full mb-4">
        <SearchX className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Uy, no encontramos casas con esos filtros
      </h3>
      <p className="text-sm text-gray-500 max-w-[250px]">
        Intenta quitando algunos filtros o buscando en otra zona para ver más resultados.
      </p>
    </div>
  )
}
