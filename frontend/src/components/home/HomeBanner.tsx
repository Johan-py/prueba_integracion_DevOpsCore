import Image from 'next/image'
import FilterBar from '../filters/FilterBar'

interface BannerProps {
  url: string;
  title?: string;
  subtitle?: string;
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[300px] bg-slate-100 flex items-center justify-center">
      <Image
        src={url}
        alt="Portada principal"
        fill
        className="object-cover"
        priority
      />

      {/* Capa oscura para que el texto blanco siempre se lea bien */}
      <div className="absolute inset-0 bg-black/45 z-0" />

      {/* Contenido centrado con anchos máximos para que no desborde en móvil */}
      <div className="relative z-10 text-center px-4 py-4 flex flex-col gap-2 md:gap-6 items-center">
        {title && (
          <h1 className="text-xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-xl max-w-[280px] md:max-w-none text-balance">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-xs md:text-xl lg:text-2xl text-stone-200 drop-shadow-lg font-medium max-w-[240px] md:max-w-2xl text-balance">
            {subtitle}
          </p>
        )}
        {/* INTEGRACIÓN: La Barra de Filtros centrada */}
        {/* Usamos un div envoltorio para asegurar el ancho máximo de 921px  */}
        <div className="hidden md:flex w-full max-w-[921px] justify-center">
          <FilterBar />
        </div>
      </div>

      {/* En móvil, mostramos la barra de filtros debajo del banner */}
      {/* Versión móvil: La barra sale debajo en pantallas pequeñas para no tapar la foto */}
      <div className="md:hidden relative z-20 -mt-10 px-4 w-full">
         {/* Aquí podrías poner una versión simplificada o la misma FilterBar ajustada */}
      </div>
      </div>
  )
}
