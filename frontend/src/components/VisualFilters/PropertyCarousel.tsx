"use client";

import { useRef, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import { useRouter } from "next/navigation";

interface CarouselItem {
  image: string;
  title: string;
  location: string;
  count?: number;
  filterParam: string;
  previews?: Array<{ imagen: string; titulo: string }>;
}

interface PropertyCarouselProps {
  title: string;
  items: CarouselItem[];
  category: "alquiler" | "venta";
}

export default function PropertyCarousel({
  title,
  items,
  category,
}: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleCardClick = (filterParam: string) => {
    const modoMap: Record<"alquiler" | "venta", string> = {
      alquiler: "ALQUILER",
      venta: "VENTA",
    };

    const modo = modoMap[category];
    const params = new URLSearchParams({
      modoInmueble: modo,
      query: filterParam,
    });

    const currentFilters = JSON.parse(sessionStorage.getItem('propbol_global_filters') || '{}');
    sessionStorage.setItem('propbol_global_filters', JSON.stringify({
      ...currentFilters,
      modoInmueble: [modo],
      query: filterParam,
      updatedAt: new Date().toISOString()
    }));

    router.push(`/busqueda_mapa?${params.toString()}`);
  };

  return (
    <div className="mb-10">
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">
        {title}
      </h2>

      <div className="relative flex items-center">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            absolute left-0 z-10 bg-white border border-gray-200
            rounded-full w-7 h-7 flex items-center justify-center
            shadow hover:bg-orange-500 hover:text-white hover:border-orange-500
            transition-colors duration-150 text-gray-500 text-base font-bold
          "
        >
          ‹
        </button>

        {/* Items */}
        <div
          ref={scrollRef}
          className=" flex gap-3 overflow-x-auto scroll-smooth px-9 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehaviorX: "contain", touchAction: "pan-x" }}
        >
          {/* ... dentro del ref={scrollRef} ... */}
          {items.map((item, i) => {
            // Obtenemos la primera imagen de las previews para mostrarla de entrada
            const mainImage = item.previews && item.previews.length > 0
              ? item.previews[0].imagen
              : item.image;

            return (
              <PropertyCard
                key={i}
                image={mainImage}
                title={item.title}
                location={item.location}
                count={item.count}
                variant={category}
                isEmpty={item.count === 0}
                previews={item.previews ?? []}
                onClick={() => handleCardClick(item.filterParam)}
              />
            );
          })}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="
            absolute right-0 z-10 bg-white border border-gray-200
            rounded-full w-7 h-7 flex items-center justify-center
            shadow hover:bg-orange-500 hover:text-white hover:border-orange-500
            transition-colors duration-150 text-gray-600 text-base font-bold
          "
        >
          ›
        </button>
      </div>
    </div>
  );
}