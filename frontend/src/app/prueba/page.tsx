// app/pago/page.tsx
'use client';

export default function ResumenCompra() {
  return (
    <div>
      {/* ================ PARTE SUPERIOR ================ */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Resumen
        </div>
        <div className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
          Pagar
        </div>
        <div className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
          Confirmación
        </div>
      </div>
      {/* ================ FIN PARTE SUPERIOR ================ */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Resumen de compra
        </h1>
      </div>
      {/* ================ PARTE INTERMEDIA ================ */}
      <div>
      </div>
      {/* ================ FIN PARTE INTERMEDIA ================ */}

      {/* ================ PARTE INFERIOR ================ */}
      <div>
      </div>
      {/* ================ FIN PARTE INFERIOR ================ */}
    </div>
  );
}