'use client'

import { type KeyboardEvent } from 'react'
import CityCarousel from '@/components/home/CityCarousel'
import type { City } from '@/types/city'

type Props = {
  city: City
  onClick: (city: City) => void
}

export default function CityCard({ city, onClick }: Props) {
  const handleClick = () => {
    onClick(city)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver propiedades de ${city.name}`}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
    >
      <CityCarousel images={city.images} cityName={city.name} />

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-stone-900 dark:text-white transition-colors duration-200 group-hover:text-amber-700 group-focus-visible:text-amber-700">
            {city.name}
          </h3>
          {city.locationReference ? (
            <p className="text-sm font-medium text-stone-500 dark:text-[#999]">{city.locationReference}</p>
          ) : null}
        </div>

        <p className="flex-1 text-sm leading-6 text-stone-600 dark:text-[#999]">{city.description}</p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            handleClick()
          }}
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Ver propiedades
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}
