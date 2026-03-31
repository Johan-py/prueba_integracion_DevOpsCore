// app/pago/page.tsx
'use client';
//borrar
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResumenCompra() {
  
  const searchParams = useSearchParams();

  // Leer los datos del plan desde la URL
  const planId = searchParams.get('planId');
  const planNombre = searchParams.get('nombre');
  const planPrecio = searchParams.get('precio'); // Este viene como string
  const planDuracion = searchParams.get('duracion');
  const planIcono = searchParams.get('icono'); // Icono del plan (emoji o URL)

  // Convertir el precio a número para hacer cálculos
  const precioNumerico = planPrecio ? parseFloat(planPrecio) : 0;

   // Calcular los valores dinámicamente
  const subtotal = precioNumerico;
  const iva = precioNumerico * 0.13; // 13% de IVA
  const descuento = 0; // Por ahora 0, pero podría venir de la URL si hay promociones
  const total = subtotal + iva - descuento;

  // Estado para controlar qué método de pago está seleccionado
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  
  // Función para manejar el toggle (abrir/cerrar)
  const handleToggleMetodo = (metodo: string) => {
    // Si el método ya está seleccionado, lo deseleccionamos (ponemos null)
    // Si no está seleccionado, lo seleccionamos
    setMetodoSeleccionado(metodoSeleccionado === metodo ? null : metodo);
  };

  // Formatear números a 2 decimales
  const formatearPrecio = (valor: number) => {
    return valor.toFixed(2);
  };

  // Función para obtener el icono según el tipo de plan (si no viene en la URL)
  const obtenerIconoPorPlan = (nombre: string) => {
    const nombreLower = nombre?.toLowerCase() || '';
    if (nombreLower.includes('básico') || nombreLower.includes('basico')) return '📦';
    if (nombreLower.includes('estándar') || nombreLower.includes('estandar')) return '📦';
    if (nombreLower.includes('premium')) return '📦';
    if (nombreLower.includes('empresarial')) return '📦';
    return '📦'; // Icono por defecto
  };

  // Determinar qué icono mostrar
  const iconoMostrar = planIcono || obtenerIconoPorPlan(planNombre || '');

  // Datos de prueba (comenta cuando tengas integración real)
  const MOCK_PLAN = {
    nombre: 'Plan Estándar',
    precio: '59.00',
    duracion: 'Mensual',
    icono: '📦'
  };
  
  // Usar datos reales o de prueba
  const nombreMostrar = planNombre || MOCK_PLAN.nombre;
  const precioMostrar = planPrecio || MOCK_PLAN.precio;
  const duracionMostrar = planDuracion || MOCK_PLAN.duracion;
  const iconoMostrarFinal = iconoMostrar || MOCK_PLAN.icono;

  // Si no hay datos del plan, mostrar mensaje de error
  //if (!planId || !planNombre || !planPrecio) {
  //  return (
  //    <div className="max-w-2xl mx-auto p-6">
  //      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
  //        <div className="text-6xl mb-4">⚠️</div>
  //        <h2 className="text-2xl font-bold text-red-700 mb-3">
  //          No hay una suscripcion seleccionada
  //        </h2>
  //        <p className="text-red-600 mb-6">
  //          Por favor, selecciona una suscripcion desde la página de suscripciones para continuar.
  //        </p>
  //        <button
  //          onClick={() => window.location.href = '/planes'}
  //          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  //        >
  //          Ver suscripciones disponibles
  //        </button>
  //      </div>
  //    </div>
  //  );
  //}


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

      {/* ================ PARTE INTERMEDIA ================ */}
        {/* RESUMEN DE COMPRA */}
       <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-left">
          Resumen de compra
        </h1>
      </div>

      {/* BLOQUE DE SUSCRIPCIÓN SELECCIONADA - DINÁMICO */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Icono del plan (dinámico según el plan seleccionado) */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl shadow-sm">
              {iconoMostrarFinal}
            </div>

            {/* Nombre del plan (dinámico según el plan seleccionado) */}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {nombreMostrar}
              </h2>
              {duracionMostrar && (
                <p className="text-sm text-gray-500 mt-1">
                  Pago {duracionMostrar.toLowerCase()}
                </p>
              )}
            </div>
          </div>
        </div>
      

       {/* METODOS DE PAGO */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-left mb-4">
          Métodos de pago
        </h2>
        
        {/* Lista de métodos de pago */}
        <div className="space-y-3">
          {/* Método de pago: QR Bancario */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              metodoSeleccionado === 'qr' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleToggleMetodo('qr')}
          >
            <div className="flex items-center gap-3">
              {/* Radio button personalizado */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                metodoSeleccionado === 'qr' 
                  ? 'border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {metodoSeleccionado === 'qr' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              
              {/* Icono y texto del método */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-semibold text-gray-800">QR Bancario</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Escanea desde tu app bancaria boliviana
                </p>
              </div>
            </div>
          </div>
          
          {/* Bloque desplegable cuando se selecciona QR */}
          {metodoSeleccionado === 'qr' && (
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg animate-fadeIn shadow-sm">
            <div className="space-y-4">
            {/* Título del bloque */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <span className="text-xl">💰</span>
              <p className="font-medium text-gray-800">Detalle de pago</p>
            </div>
      
            {/* ================ DETALLES DE PAGO ================ */}
            <div className="space-y-2">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      Bs. {formatearPrecio(subtotal)}
                    </span>
                  </div>
                  
                  {/* IVA (13%) */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">IVA (13%)</span>
                    <span className="font-medium text-gray-800">
                      Bs. {formatearPrecio(iva)}
                    </span>
                  </div>
                  
                  {/* Descuento */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Descuento</span>
                    <span className="font-medium text-green-600">
                      - Bs. {formatearPrecio(descuento)}
                    </span>
                  </div>
                </div>
                
                {/* Línea separadora */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Total a pagar */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-800">Total a pagar</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Bs. {formatearPrecio(total)}
                  </span>
                </div>
                
                {/* Instrucciones de pago con QR */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-blue-800 font-medium text-sm">
                        Escanea el código QR con tu aplicación bancaria
                      </p>
                      <p className="text-blue-600 text-xs mt-1">
                        Una vez realizado el pago, confirma la transacción para continuar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Botón para continuar (opcional) */}
        <button
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!metodoSeleccionado}
          onClick={() => {
            if (metodoSeleccionado === 'qr') {
              console.log('Procesando pago con QR...');
              console.log('Total a pagar:', total);
              // Aquí puedes redirigir al siguiente paso
            }
          }}
        >
          Continuar con el pago
        </button>
      </div>
      {/* ================ FIN PARTE INTERMEDIA ================ */}

      {/* ================ PARTE INFERIOR ================ */}
      <div>
      </div>
      {/* ================ FIN PARTE INFERIOR ================ */}
    </div>
  );
}