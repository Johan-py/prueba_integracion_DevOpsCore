interface Props {
  transaccion: any;
}

export default function ResumenTransaccion({ transaccion }: Props) {
  // transaccion incluye plan_suscripcion (relación)
  const plan = transaccion.plan_suscripcion;
  const { subtotal, iva_monto, total } = transaccion;

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6 shadow-sm bg-white">
      <div className="mb-4 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          {plan.nombre_plan}
        </h2>
        <p className="text-gray-500 text-sm">
          {plan.nro_publicaciones_plan} publicaciones activas · 
          Vigencia {plan.duración_plan_días} días
        </p>
      </div>

      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Bs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>IVA (13%)</span>
          <span>Bs. {iva_monto.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2 text-gray-900">
          <span>Total a pagar</span>
          <span>Bs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}