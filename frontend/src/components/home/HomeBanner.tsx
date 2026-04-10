import Image from 'next/image'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    <div
      className="relative w-full 
      h-[20vh] sm:h-[25vh] md:h-[60vh] 
      min-h-[180px] md:min-h-[300px] 
      bg-slate-100 overflow-hidden flex items-center justify-center"
    >
      <Image
        src={url}
        alt="Portada principal"
        fill
        className="object-cover object-top md:object-center pointer-events-none"
        priority
      />

      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      <div className="relative z-10 text-center px-4 flex flex-col items-center gap-2 md:gap-6">
        {title && (
          <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-xl leading-tight">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-xs sm:text-sm md:text-xl lg:text-2xl text-stone-200 drop-shadow-lg font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}