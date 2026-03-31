'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  imagenQrUrl: string;
  total: number;
}

export default function BotonQrBancario({ imagenQrUrl, total }: Props) {
  const [mostrarQr, setMostrarQr] = useState(false);

  return (
    <div className="mt-6">
      {!mostrarQr ? (
        <button
          onClick={() => setMostrarQr(true)}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-md"
        >
          Continuar con QR Bancario
        </button>
      ) : (
        <div className="text-center p-5 border border-gray-200 rounded-lg bg-gray-50">
          <p className="mb-3 text-gray-700">
            Escanea desde tu app bancaria boliviana
          </p>
          {imagenQrUrl && (
            <Image
              src={imagenQrUrl}
              alt="Código QR para pago"
              width={200}
              height={200}
              className="mx-auto border border-gray-300 rounded-md"
            />
          )}
          <p className="mt-3 text-sm font-medium text-gray-800">
            Monto a pagar: Bs. {total.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}