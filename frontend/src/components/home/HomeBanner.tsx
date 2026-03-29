import Image from 'next/image'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[300px] bg-slate-100 flex items-center justify-center">
      <Image src={url} alt="Portada principal" fill className="object-cover" priority />

      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col gap-4">
        {title && (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl lg:text-2xl text-stone-100 drop-shadow-md font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
