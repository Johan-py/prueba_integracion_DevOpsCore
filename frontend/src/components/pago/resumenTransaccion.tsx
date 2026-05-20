interface Props {
  transaccion: any
}

export default function ResumenTransaccion({ transaccion }: Props) {
  const { subtotal, iva_monto, total, monto_descuento } = transaccion;

  return (
    <div className="border border-gray-200 dark:border-[#333] rounded-lg p-6 shadow-lg bg-white dark:bg-[#1a1a1a]">
      <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100 dark:border-[#333] dark:text-white">Resumen de compra</h3>
      <div className="space-y-3 text-gray-700 dark:text-[#ccc]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (13%)</span>
          <span className="font-semibold">Bs. {iva_monto.toFixed(2)}</span>
        </div>
        {monto_descuento > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>- Bs. {monto_descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-[#333] mt-2">
          <span>Total a pagar</span>
          <span className="text-green-700">Bs. {total.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center border border-green-100 dark:border-green-800/30">
        <p className="text-sm text-green-800 font-medium">Total a pagar</p>
        <p className="text-2xl font-bold text-green-700">Bs. {total.toFixed(2)}</p>
        <p className="text-xs text-green-600 mt-1">IVA incluido</p>
      </div>
    </div>
  );
}
