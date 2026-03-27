import Image from 'next/image';

interface BannerProps {
  url: string;
}

export const HomeBanner = ({ url }: BannerProps) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[300px] bg-slate-100"> 
      <Image 
        src={url} 
        alt="Portada principal" 
        fill 
        className="object-cover"
        priority
      />
    </div>
  );
};