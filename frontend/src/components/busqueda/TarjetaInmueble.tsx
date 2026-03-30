import { Inmueble } from '../../types/inmueble'
import { BedDouble, Bath, Maximize, MapPin, Star } from 'lucide-react'

interface TarjetaInmuebleProps {
  inmueble: Inmueble
}

export const TarjetaInmueble = ({ inmueble }: TarjetaInmuebleProps) => {
  const formatoMoneda = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })

  const ubicacionTexto = typeof inmueble.ubicacion === 'object' && inmueble.ubicacion !== null
    ? `${inmueble.ubicacion.zona ?? ''}, ${inmueble.ubicacion.ciudad ?? ''}`
    : ''

  return (
    <div className="group flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3`}
          alt={inmueble.titulo}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
        {(inmueble.popularidad ?? 0) > 80 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-xs font-semibold text-gray-800">Popular</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight line-clamp-1">
            {inmueble.titulo}
          </h3>
          <span className="text-lg font-bold text-gray-900 whitespace-nowrap ml-2">
            {formatoMoneda.format(Number(inmueble.precio))}
          </span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
          <span className="line-clamp-1">{ubicacionTexto}</span>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between text-gray-600 text-sm font-medium">
          <div className="flex items-center gap-1.5" title="Habitaciones">
            <BedDouble className="w-4 h-4 text-blue-500" />
            <span>{inmueble.nroCuartos ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Baños">
            <Bath className="w-4 h-4 text-orange-500" />
            <span>{inmueble.nroBanos ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Superficie total">
            <Maximize className="w-4 h-4 text-blue-500" />
            <span>{inmueble.superficieM2 ?? '-'} m²</span>
          </div>
        </div>
      </div>
    </div>
  )
}