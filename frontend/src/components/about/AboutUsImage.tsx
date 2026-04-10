import Image from "next/image";

type AboutUsImageProps = {
  alt: string;
  className: string;
  src: string;
};

export default function AboutUsImage({
  alt,
  className,
  src,
}: AboutUsImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 1280px) 560px, (min-width: 640px) 80vw, 100vw"
      />
    </div>
  );
}
