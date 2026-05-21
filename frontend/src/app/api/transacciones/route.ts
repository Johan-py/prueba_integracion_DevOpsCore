import { NextResponse } from 'next/server';
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export async function POST(request: Request) {
  try {
    const { idSuscripcion } = await request.json();
    if (!idSuscripcion) {
      return NextResponse.json({ error: 'Falta el ID del plan' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Debes iniciar sesión para suscribirte' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/transacciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ idSuscripcion }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear transacción');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en API transacciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}