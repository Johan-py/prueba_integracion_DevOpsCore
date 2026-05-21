'use client'

import React from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'

interface QRDisplayProps {
  value: string
  imageSrc?: string
  size?: number
  id?: string
  className?: string
}

export function QRDisplay({ value, imageSrc, size = 250, id, className = '' }: QRDisplayProps) {
  if (!value && !imageSrc) {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 p-4 rounded-xl text-center text-red-600">
          Error: QR sin contenido
        </div>
      </div>
    )
  }

  const qrElement = imageSrc ? (
    <Image
      src={imageSrc}
      alt="QR de pago"
      width={size}
      height={size}
      className="rounded-lg"
      priority
      unoptimized
    />
  ) : (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#000000"
      level="L"
      includeMargin={false}
    />
  )

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <div className="bg-white p-3 rounded-xl shadow-inner border border-stone-200">
        {qrElement}
      </div>
      {id && (
        <p className="text-xs text-center text-stone-500 mt-2">
          {id} · Escanea este código desde tu aplicación bancaria
        </p>
      )}
    </div>
  )
}
