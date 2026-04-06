'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRDisplayProps {
  value: string
  size?: number // si se define, tamaño fijo en px
  id?: string
  className?: string // clase para el contenedor exterior
}

export function QRDisplay({ value, size, id, className = '' }: QRDisplayProps) {
  if (!value) {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 p-4 rounded-xl text-center text-red-600">
          Error: QR sin contenido
        </div>
      </div>
    )
  }

  const qrElement = size ? (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#000000"
      level="L"
      includeMargin={false}
    />
  ) : (
    <QRCodeSVG
      value={value}
      bgColor="#ffffff"
      fgColor="#000000"
      level="L"
      includeMargin={false}
      style={{ width: '100%', height: 'auto' }}
    />
  )

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <div className="bg-white p-4 rounded-xl shadow-inner border border-stone-200 dark:border-stone-700">
        {qrElement}
      </div>
      {id && (
        <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-2">
          {id} · Escanea este código desde tu aplicación bancaria
        </p>
      )}
    </div>
  )
}
