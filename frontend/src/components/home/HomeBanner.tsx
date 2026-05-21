import Image from 'next/image'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

// Se mantuvo la version anterior del banner desktop, pero la responsive del actual
export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    // HU-05: ID de referencia para el tour guiado - Paso "Bienvenida"
    // Este contenedor será resaltado como primer paso del tour al ingresar al sistema
    <div
      id="tour-banner"
      className="relative w-full 
      h-[20vh] sm:h-[25vh] md:h-[60vh] 
      min-h-[180px] md:min-h-[300px] 
      bg-slate-100 overflow-hidden flex items-center justify-center"
    >
      <Image
        src={url}
        alt="Portada principal"
        fill
        className="object-cover object-top md:object-center"
        priority
        unoptimized
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-black/45 z-0" />

      {/* contenido */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center gap-2 md:gap-6">
        {title && (
          <h1
            className="
            text-xl sm:text-2xl 
            md:text-5xl lg:text-6xl 
            font-bold text-white 
            drop-shadow-xl 
            max-w-[280px] md:max-w-none 
            leading-tight text-balance
          "
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p
            className="
            text-xs sm:text-sm 
            md:text-xl lg:text-2xl 
            text-stone-200 
            drop-shadow-lg 
            font-medium 
            max-w-[240px] md:max-w-2xl 
            text-balance
          "
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="md:hidden absolute bottom-0 translate-y-1/2 w-full px-4 z-20"></div>
    </div>
  )
}