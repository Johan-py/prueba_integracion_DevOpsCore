// app/pago/page.tsx
'use client';

export default function ResumenCompra() {
  return (
    <div>
      {/* ================ PARTE SUPERIOR ================ */}
       <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Resumen</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Pagar</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
            2
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Confirmación</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
            3
          </div>
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