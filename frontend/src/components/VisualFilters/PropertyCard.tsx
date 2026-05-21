"use client";

import { useEffect, useState } from "react";

interface Preview {
  imagen: string;
  titulo: string;
}
interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  count?: number;
  onClick?: () => void;
  variant?: "alquiler" | "venta";
  isEmpty?: boolean;
  previews?: Preview[];
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}/${url.replace(/^\/+/, "")}`;
};

export default function PropertyCard({
  image,
  title,
  location,
  count,
  onClick,
  variant = "alquiler",
  isEmpty = false,
  previews = [],
}: PropertyCardProps) {
  const isAlquiler = variant === "alquiler";

  const slides: Preview[] =
    previews.length > 0
      ? previews.map(p => ({ ...p, imagen: getImageUrl(p.imagen) }))
      : [{ imagen: getImageUrl(image), titulo: title }];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
  const showImage = Boolean(currentSlide?.imagen);


  return (
    <div
      onClick={isEmpty ? undefined : onClick}
      className={`
        group relative flex flex-col rounded-[20px] overflow-hidden bg-white
        shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-3
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]
        ${isAlquiler ? "min-w-[220px] w-[220px]" : "min-w-[240px] w-[240px]"}
        flex-shrink-0
      `}
    >
      {/* Imagen */}
      <div
        className={`
          relative w-full overflow-hidden bg-gray-100 rounded-2xl
          ${isAlquiler ? "h-[140px]" : "h-[160px]"}
        `}
      >
        {isEmpty || !showImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-gray-300"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] font-medium text-gray-400">Sin imagen</span>
          </div>
        ) : (
          <>
            <img
              key={currentIndex}
              src={currentSlide.imagen}
              alt={currentSlide.titulo}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const cityFallback = getImageUrl(image);
                if (cityFallback && img.src !== cityFallback) {
                  img.src = cityFallback;
                } else {
                  img.src = "/placeholder-house.jpg";
                }
              }}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Indicadores de slide */}
            {slides.length > 1 && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? "bg-white" : "bg-white/40"
                      }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ALQUILERES: badge superior derecho */}
        {isAlquiler && count !== undefined && (
          <span
            className={`
              absolute top-2 right-2 text-white text-[9px] font-bold
              px-2 py-0.5 rounded-full tracking-wide
              ${isEmpty ? "bg-gray-400" : "bg-orange-500"}
            `}
          >
            {isEmpty ? "SIN DATOS" : `${count.toLocaleString()} PROP.`}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col px-1 pt-3 pb-1">
        {/* Nombre de la ciudad */}
        <p className="text-[10px] font-extrabold text-[#b48348] uppercase tracking-wider">
          {title}
        </p>

        {/* Título de la propiedad */}
        <p className="text-[15px] font-black text-gray-900 truncate mt-1">
          {previews.length > 0 && !isEmpty ? currentSlide.titulo : (isEmpty ? "Sin inmuebles" : "Destacados")}
        </p>

        {/* Cantidad de propiedades */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] font-medium text-gray-500">
            {isEmpty ? "Sin propiedades" : `${count?.toLocaleString()} Propiedades`}
          </span>
          {!isEmpty && (
            <span className="text-[#b48348] text-lg font-bold leading-none translate-x-0 group-hover:translate-x-1 transition-transform">
              →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}