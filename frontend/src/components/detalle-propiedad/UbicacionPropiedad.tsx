'use client'
import ComoLlegarButton from '@/components/galeria/ComoLlegarButton'
import dynamic from 'next/dynamic'
import { PuntoInteres } from '@/types/detallePropiedad'

const MapaDinamico = dynamic(() => import('./MapaInteractivo'), {
  ssr: false,
  loading: () => <p className="text-center text-[#5f5a54]">Cargando mapa interactivo...</p>
})

interface Props {
  mapa: {
    latitud: number | null
    longitud: number | null
    direccion: string | null
  }
  puntosDeInteres?: PuntoInteres[]
}
export default function UbicacionPropiedad({ mapa, puntosDeInteres }: Props) {
  return (
    <section className="space-y-3" role="region" aria-label="Ubicación de la propiedad">
      <h2 className="text-[18px] font-bold text-[#1f1f1f] md:text-[20px]">Ubicación y Puntos de Interés</h2>
      <div className="overflow-hidden rounded-2xl border border-[#beb4a8] bg-[#dbe8d7]">
        {mapa.latitud !== null && mapa.longitud !== null ? (
          <div className="h-[290px] w-full relative">
            <MapaDinamico 
              latitud={mapa.latitud} 
              longitud={mapa.longitud} 
              puntosDeInteres={puntosDeInteres} 
            />
          </div>
        ) : (
          <div className="flex h-[290px] items-center justify-center text-[#5f5a54]">
            Ubicación no disponible
          </div>
        )}
      </div>
      
      {mapa.direccion && (
        <p className="text-sm font-medium text-[#2c2824] mt-2">
          Dirección referencial: {mapa.direccion}
        </p>
      )}

      {/* HU13 - Botón de redirección a mapas en detalle de publicación */}
      <div className="mt-3">
        <ComoLlegarButton
          data-testid="como-llegar-detalle" lat={mapa.latitud} lng={mapa.longitud} />
      </div>
    </section>
  )
}
