// frontend/src/components/layout/PropertyCard.tsx
import Image from 'next/image'; 
import { BedDouble, Bath, Square, ImageOff } from 'lucide-react'; // Quité MessageSquareText porque ya viene en tu botón
import ContactButton from '../galeria/ContactButton'; // <-- Tu botón modular importado

type PropsTarjeta = {
  imagen?: string;
  estado: string; 
  precio: string; 
  descripcion: string; 
  camas: number;
  banos: number;
  metros: number;
};

// 1. Definimos una constante para el color gris de fondo cuando no hay imagen
const COLOR_GRIS_PLACEHOLDER = "bg-gray-200";

export default function PropertyCard({ 
  imagen, 
  estado, 
  precio, 
  descripcion, 
  camas, 
  banos, 
  metros 
}: PropsTarjeta) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100 group">
      
      {/* 2. Implementación de Imagen o Cuadro Gris (Misión Día 3) */}
      <div className={`relative aspect-[16/10] overflow-hidden ${!imagen ? COLOR_GRIS_PLACEHOLDER : ''} flex items-center justify-center`}>
        {imagen ? (
          <Image
            src={imagen}
            alt={descripcion}
            fill
            sizes="(max-w-7xl) 30vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Icono de cámara tachada si no hay foto para que no se vea feo */
          <div className="flex flex-col items-center text-gray-400">
            <ImageOff className="w-12 h-12 mb-1" />
            <span className="text-[10px] font-medium uppercase">Sin foto disponible</span>
          </div>
        )}
        
        <span className="absolute top-3 left-3 bg-[#ea580c] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-sm shadow uppercase tracking-wider z-10">
          {estado}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight">{precio}</h2>

        <p className="text-sm text-gray-800 line-clamp-2 font-medium leading-relaxed min-h-[40px]">
          {descripcion}
        </p>

        <div className="flex items-center gap-4 text-gray-600 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <BedDouble className="w-4 h-4 text-[#ea580c]" /> {camas}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Bath className="w-4 h-4 text-[#ea580c]" /> {banos}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold border border-gray-200 bg-gray-50 px-2 py-0.5 rounded">
            <Square className="w-4 h-4 text-gray-500" /> {metros} m²
          </span>
        </div>

        {/* 3. Botón de contacto modular */}
        <div className="mt-1 w-full">
           <ContactButton type="whatsapp" variant="grid" />
        </div>
      </div>
    </div>
  );
}