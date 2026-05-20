
import type { DetallePropiedad } from '@/types/detallePropiedad'

interface Props {
  detalle: DetallePropiedad
  esOferta?: boolean
  porcentajeDescuento?: number
  formatPrice?: (value?: number) => string
}

function traducirOperacion(value: string) {
  switch (value) {
    case 'VENTA':
      return 'venta'
    case 'ALQUILER':
      return 'alquiler'
    case 'ANTICRETO':
      return 'anticrético'
    default:
      return value.toLowerCase()
  }
}

function traducirTipo(value: string | null) {
  if (!value) return ''

  switch (value) {
    case 'DEPARTAMENTO':
      return 'Departamento'
    case 'CASA':
      return 'Casa'
    case 'TERRENO':
      return 'Terreno'
    case 'OFICINA':
      return 'Oficina'
    default:
      return value
  }
}

export default function ResumenPropiedad({ detalle, esOferta, porcentajeDescuento, formatPrice }: Props) {
  const precioFormateado = `$${detalle.precio.toLocaleString()} USD`
  const tipo = traducirTipo(detalle.tipoInmueble)
  const operacion = traducirOperacion(detalle.tipoOperacion)

  return (
    <section className="max-w-[760px] space-y-2">
      <p className="text-sm text-[#8d7f6f]">{detalle.ubicacionTexto}</p>

      <h1 className="text-[28px] font-bold leading-tight text-[#222] md:text-[30px]">
        {detalle.titulo}
      </h1>

      {esOferta ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[24px] font-bold text-orange-600 md:text-[26px]">
            ${formatPrice?.(detalle.precio)} USD
          </span>
          <span className="text-lg text-gray-500 line-through font-bold">
            ${formatPrice?.(detalle.precio_anterior)} USD
          </span>
        </div>
      ) : (
        <p className="text-[24px] font-bold text-orange-600 md:text-[26px]">
          {precioFormateado}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        {tipo && (
          <span className="rounded-full bg-[#e4ddd3] px-4 py-1.5 text-sm text-[#4c463f]">
            {tipo}
          </span>
        )}
        <span className="rounded-full bg-[#e4ddd3] px-4 py-1.5 text-sm text-[#4c463f]">
          {operacion}
        </span>
      </div>
    </section>
  )
}