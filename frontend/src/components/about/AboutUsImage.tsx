type AboutUsImageProps = {
  alt: string
  className: string
  src: string
}

export default function AboutUsImage({ alt, className, src }: AboutUsImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}
