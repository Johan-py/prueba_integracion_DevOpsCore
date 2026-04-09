import Image from "next/image";

interface BannerProps {
  url: string;
  title?: string;
  subtitle?: string;
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    <div className="relative w-full h-[20vh] sm:h-[25vh] md:h-[35vh] min-h-[180px] max-h-[300px] bg-slate-100 overflow-hidden">
      <Image
        src={url}
        alt="Portada principal"
        fill
        className="object-cover object-top sm:object-[center_10%]"
        priority
      />

      {/* Capa oscura para que el texto blanco siempre se lea bien */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Contenedor absoluto para forzar el centrado perfecto del texto */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto text-center">
        {title && (
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg text-balance leading-tight mb-2">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-xs sm:text-sm md:text-base text-white opacity-90 drop-shadow-md text-balance max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-20 px-4 w-full flex justify-center">
    
      </div>
    </div>
  );
};
