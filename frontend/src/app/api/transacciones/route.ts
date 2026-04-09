import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Body recibido:', body)

    // Datos mock de respuesta
    const mockTransaccion = {
      id: 123,
      total: 66.67,
      plan_suscripcion: {
        nombre_plan: 'Estándar',
        nro_publicaciones_plan: 10,
        duración_plan_días: 60,
        imagen_gr_url: '/qrs/estandar.png'
      },
      subtotal: 59.0,
      iva_monto: 7.67
    }

    return NextResponse.json(mockTransaccion, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
