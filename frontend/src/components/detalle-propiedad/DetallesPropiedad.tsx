import type { DetallePropiedad } from '@/types/detallePropiedad'

interface Props {
  detalle: DetallePropiedad
}

export default function DetallesPropiedad({ detalle }: Props) {
  const { habitaciones, banos, superficieUtil } = detalle.detalles

  return (
    
    <section className="rounded-2xl border border-[#beb4a8] bg-[#ede7dc] px-7 py-6">
      <h2 className="mb-6 text-[18px] font-bold text-[#1f1f1f]  md:text-[20px]">
        Detalles de la propiedad
      </h2>

      <div className="space-y-7">

        {/* Espacios */}
        <div>
          <h3 className="mb-3 text-[16px] font-bold text-[#1f1f1f]">Espacios</h3>
          <div className="grid grid-cols-2 text-sm">
            <div className="flex items-center gap-48">
              <p className="text-[#7e7469]">Habitaciones</p>
              <p className="font-semibold text-[#2d2925]">{habitaciones ?? '-'}</p>
            </div>
            <div className="flex items-center gap-48">
              <p className="text-[#7e7469]">Baños</p>
              <p className="font-semibold text-[#2d2925]">{banos ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Superficies */}
        <div>
          <h3 className="mb-3 text-[16px] font-bold text-[#1f1f1f]">Superficies</h3>
          <div className="grid grid-cols-2 text-sm">
            <div className="flex items-center gap-40">
              <p className="text-[#7e7469]">Superficie útil</p>
              <p className="font-semibold text-[#2d2925]">
                {superficieUtil ? `${superficieUtil} m²` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Características adicionales */}
        {detalle.caracteristicasAdicionales.length > 0 && (
          <div>
            <h3 className="mb-3 text-[16px] font-bold text-[#1f1f1f]">
              Características adicionales
            </h3>
            <div className="flex flex-wrap gap-x-12 gap-y-3 text-sm text-[#4f4841]">
              {detalle.caracteristicasAdicionales.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}