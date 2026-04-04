interface Props {
  transaccion: any
}

export default function ResumenTransaccion({ transaccion }: Props) {
  const plan = transaccion.plan_suscripcion
  const { subtotal, iva_monto, total } = transaccion

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100">Resumen de compra</h2>
      <p className="text-sm text-gray-500 mb-4">Verifica tu pedido antes de realizar el pago</p>
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (13%)</span>
          <span className="font-semibold">Bs. {iva_monto.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
          <span>Total a pagar</span>
          <span className="text-green-700">Bs. {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Caja destacada para el total (similar al mockup) */}
      <div className="mt-6 bg-green-50 p-4 rounded-lg text-center border border-green-100">
        <p className="text-sm text-green-800 font-medium">Total a pagar</p>
        <p className="text-2xl font-bold text-green-700">Bs. {total.toFixed(2)}</p>
        <p className="text-xs text-green-600 mt-1">IVA incluido</p>
      </div>
    </div>
  )
}
