'use client'

import { MapPin, MapPinOff } from 'lucide-react'

interface MapPinIconProps {
  hasValidLocation: boolean
  className?: string
}

export function MapPinIcon({ hasValidLocation, className = 'w-5 h-5' }: MapPinIconProps) {
  if (hasValidLocation) {
    return <MapPin className={`${className} text-[#ea580c]`} />
  }

  return (
    <div className="relative">
      <MapPin className={`${className} text-gray-300`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-[2px] bg-red-400 rotate-45 absolute top-1/2 left-0 -translate-y-1/2" />
      </div>
    </div>
  )
}
