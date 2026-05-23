"use client"
"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CityCard from "@/components/home/CityCard";
import { useCitiesCarousel } from "@/hooks/useCitiesCarousel";
import { City } from "@/types/city";

type Props = {
  cities: City[];
};

const SWIPE_THRESHOLD = 56;

function getVisibleColumns(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function FeaturedCitiesSectionSkeleton() {
  return (
    <section className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mx-auto h-10 w-80 animate-pulse rounded-xl bg-stone-100 dark:bg-[#333]" />
        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded-xl bg-stone-100 dark:bg-[#333]" />
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-stone-200/80 dark:border-[#333] bg-white/60 dark:bg-[#1a1a1a]/60 px-6 py-10 shadow-sm backdrop-blur sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`featured-city-skeleton-${index}`}
              className="overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] shadow"
            >
              <div className="h-48 animate-pulse bg-stone-100 dark:bg-[#333]" />
              <div className="space-y-4 p-6">
                <div className="mx-auto h-7 w-40 animate-pulse rounded-lg bg-stone-100 dark:bg-[#333]" />
                <div className="mx-auto h-4 w-32 animate-pulse rounded-lg bg-stone-100 dark:bg-[#333]" />
                <div className="space-y-2">
                  <div className="h-4 animate-pulse rounded-lg bg-stone-100 dark:bg-[#333]" />
                  <div className="h-4 animate-pulse rounded-lg bg-stone-100 dark:bg-[#333]" />
                </div>
                <div className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-[#333]" />
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default function FeaturedCitiesSection({ cities }: Props) {
  const router = useRouter();
  const touchStartXRef = useRef<number | null>(null);

  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const syncColumns = () => {
      setColumns(getVisibleColumns(window.innerWidth));
    };

    syncColumns();
    window.addEventListener("resize", syncColumns);

    return () => {
      window.removeEventListener("resize", syncColumns);
    };
  }, []);

  const pages = useMemo(() => {
    const groupedCities: City[][] = [];

    for (let pageIndex = 0; pageIndex < cities.length; pageIndex += columns) {
      groupedCities.push(cities.slice(pageIndex, pageIndex + columns));
    }

    return groupedCities;
  }, [cities, columns]);

  const totalPages = pages.length;

  const { index, next, prev, goTo } = useCitiesCarousel(totalPages);

  const handleClick = (city: City) => {
    const params = new URLSearchParams({
      query: city.name,
    });

    router.push(`/busqueda?${params.toString()}`);
  };

  if (cities.length === 0) {
    return (
      <section className="px-6 py-10 text-center sm:px-8 lg:px-10">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
          ¿Dónde quieres vivir?
        </h2>
        <p className="mt-3 text-base text-stone-600 dark:text-[#999] sm:text-lg">
          Explora las ciudades más buscadas por otros usuarios
        </p>
        <p className="mt-10 text-stone-600 dark:text-[#999]">No hay ciudades disponibles</p>
      </section>
    );
  }

  const shouldPaginate = totalPages > 1;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (touchStartX === null || touchEndX === undefined) return;

    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) return;

    if (swipeDistance < 0) {
      next();
      return;
    }

    prev();
  };

  return (
    <section className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
          ¿Dónde quieres vivir?
        </h2>
        <p className="mt-3 text-base text-stone-600 dark:text-[#999] sm:text-lg">
          Explora las ciudades más buscadas por otros usuarios
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-stone-200/80 dark:border-[#333] bg-white/60 dark:bg-[#1a1a1a]/60 px-6 py-10 shadow-sm backdrop-blur sm:px-8">
        <div className="flex items-center gap-4">
          {shouldPaginate ? (
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-[#333] bg-white dark:bg-[#222] text-amber-500 dark:text-amber-400 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 dark:disabled:text-[#555] lg:inline-flex"
              aria-label="Mostrar ciudades anteriores"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <div
            className="flex-1 overflow-hidden"
            onTouchStart={shouldPaginate ? handleTouchStart : undefined}
            onTouchEnd={shouldPaginate ? handleTouchEnd : undefined}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {pages.map((page, pageIndex) => (
                <div
                  key={`cities-page-${columns}-${pageIndex}`}
                  className="w-full shrink-0"
                >
                  <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {page.map((city) => (
                      <div key={city.id} className="w-full max-w-sm">
                        <CityCard city={city} onClick={handleClick} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shouldPaginate ? (
            <button
              type="button"
              onClick={next}
              disabled={index >= totalPages - 1}
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-[#333] bg-white dark:bg-[#222] text-amber-500 dark:text-amber-400 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 dark:disabled:text-[#555] lg:inline-flex"
              aria-label="Mostrar ciudades siguientes"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>

        {shouldPaginate ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-[#333] bg-white dark:bg-[#222] text-amber-500 dark:text-amber-400 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 dark:disabled:text-[#555]"
                aria-label="Mostrar ciudades anteriores"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={next}
                disabled={index >= totalPages - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-[#333] bg-white dark:bg-[#222] text-amber-500 dark:text-amber-400 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 dark:disabled:text-[#555]"
                aria-label="Mostrar ciudades siguientes"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500 dark:text-[#999]">
                Pagina {index + 1} de {totalPages}
              </p>

              <div className="flex items-center justify-center gap-3">
                {Array.from({ length: totalPages }, (_, dotIndex) => (
                  <button
                    key={`cities-page-${dotIndex + 1}`}
                    type="button"
                    onClick={() => goTo(dotIndex)}
                    className={`h-2.5 rounded-full transition-all ${
                      dotIndex === index ? "w-8 bg-amber-500" : "w-2.5 bg-stone-300 dark:bg-[#555]"
                    }`}
                    aria-label={`Mostrar grupo de ciudades ${dotIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
