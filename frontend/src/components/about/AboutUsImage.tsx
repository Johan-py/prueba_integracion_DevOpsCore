import Image from 'next/image'

type AboutUsImageProps = {
  alt: string
  className: string
  src: string
}

export default function AboutUsImage({ alt, className, src }: AboutUsImageProps) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Image src={src} alt={alt} fill sizes="100vw" />
    </div>
  )
}
