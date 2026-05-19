import { useEffect, useState } from 'react';
import { X, Loader2, BarChart2, Info } from 'lucide-react';
import { useCompareStore } from '@/hooks/useCompareStore';

// 1. Ampliamos la interfaz con la estructura exacta que envía Prisma
interface PropertyData {
  id: number;
  titulo: string;
  precio: number;
  categoria: string;
  superficieM2?: number;
  nroCuartos?: number;
  nroBanos?: number;
  nroParqueos?: number; 
  antiguedad?: number; 
  estado_conservacion?: string; 
  publicaciones?: { multimedia?: { url: string }[] }[];
  inmueble_etiqueta?: { etiqueta: { nombre: string } }[];
  inmueble_amenidad?: { amenidad: { nombre: string } }[]; 
}

interface ComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparatorModal({ isOpen, onClose }: ComparatorModalProps) {
  const { selectedIds, removeProperty } = useCompareStore();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedIds.length < 2) {
      onClose();
    }
  }, [selectedIds.length, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || selectedIds.length === 0) return;

    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
   
        const res = await fetch(`${API_URL}/api/propiedad/comparar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (!res.ok) throw new Error(`Error en la petición: HTTP ${res.status}`);

        const data = await res.json();
       
        if (data.ok) {
          setProperties(data.data);
        }
      } catch (error) {
        console.error("Error al cargar comparativa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [isOpen]);

  useEffect(() => {
    setProperties(prev => prev.filter(p => selectedIds.includes(String(p.id))));
  }, [selectedIds]);

  if (!isOpen) return null;

  const renderVal = (val: string | number | undefined | null, suffix = '') => {
    if (val === null || val === undefined || val === '') return <span className="text-stone-400 font-normal">-</span>;
    return <span className="font-semibold text-stone-700">{val} {suffix}</span>;
  };

  return (
    //  Modal superpuesto oscureciendo el fondo
    <div className="fixed inset-0 z-[9999] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#ea580c]" />
            <h2 className="text-xl font-bold text-stone-800">Comparativa de Inmuebles</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#ea580c]" />
              <p className="text-sm font-medium">Sincronizando parámetros...</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-8">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-30 bg-white border-b border-r border-stone-200 p-4 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Atributo</span>
                    </th>
                    {properties.map((prop) => (
                      <th key={prop.id} className="border-b border-stone-200 p-4 w-72 bg-white align-top relative group">
                        <button
                          onClick={() => removeProperty(String(prop.id))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100 z-10"
                          title="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                       
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 mb-3 relative">
                          <img
                            src={prop.publicaciones?.[0]?.multimedia?.[0]?.url || '/placeholder-house.jpg'}
                            alt={prop.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-tight">
                          {prop.titulo}
                        </h3>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Precio</td>
                    {properties.map(prop => <td key={prop.id} className="p-4 text-lg font-bold text-[#ea580c]">$ {prop.precio}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tipo</td>
                    {properties.map(prop => (
                      <td key={prop.id} className="p-4">
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-md uppercase">{prop.categoria || '-'}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Superficie</td>
                    {properties.map(prop => <td key={prop.id} className="p-4 text-sm">{renderVal(prop.superficieM2, 'm²')}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Habitaciones</td>
                    {properties.map(prop => <td key={prop.id} className="p-4 text-sm">{renderVal(prop.nroCuartos)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Baños</td>
                    {properties.map(prop => <td key={prop.id} className="p-4 text-sm">{renderVal(prop.nroBanos)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-stone-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Etiquetas</td>
                    {properties.map(prop => {
                      const tags = prop.inmueble_etiqueta || [];
                      return (
                        <td key={prop.id} className="p-4">
                          {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map(t => (
                                <span key={`tag-${prop.id}-${t.etiqueta.nombre}`} className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-[11px] font-bold uppercase tracking-wide">
                                  {t.etiqueta.nombre}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm italic text-stone-400">Sin etiquetas</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* 👇 NUEVA FILA 2: AMENIDADES */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="sticky left-0 z-20 bg-white border-r border-stone-200 p-4 text-sm font-semibold text-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Amenidades</td>
                    {properties.map(prop => {
                      // Ya podemos mapear inmueble_amenidad sin que TS se queje
                      const amenidades = prop.inmueble_amenidad || [];
                      return (
                        <td key={prop.id} className="p-4">
                          {amenidades.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {amenidades.map(a => (
                                <span key={`amenity-${prop.id}-${a.amenidad.nombre}`} className="px-2.5 py-1 bg-orange-50 text-[#ea580c] border border-orange-200 rounded-lg text-xs font-medium">
                                  {a.amenidad.nombre}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm italic text-stone-400">Sin amenidades</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}