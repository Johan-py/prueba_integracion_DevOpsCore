"use client";

import { useState, useEffect } from "react";
import { HomeBanner } from "./HomeBanner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerData {
  id: number;
  urlImagen: string;
  titulo?: string;
  subtitulo?: string;
}

export const HomeCarousel = ({ banners }: { banners: BannerData[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative w-full">
      <HomeBanner
        url={banners[currentIndex].urlImagen}
        title={banners[currentIndex].titulo || "Encuentra tu lugar ideal"}
        subtitle={banners[currentIndex].subtitulo}
      />
      <>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronLeft size={30} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronRight size={30} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? "bg-white w-4"
                  : "bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      </>
    </div>
  );
};