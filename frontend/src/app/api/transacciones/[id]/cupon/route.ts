import { NextResponse } from 'next/server';
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const transaccionId = parseInt(params.id, 10);
    const { codigo, totalOriginal } = await request.json();

    if (!codigo) {
      return NextResponse.json({ error: 'Ingresa un código' }, { status: 400 });
    }
    if (totalOriginal === undefined || isNaN(totalOriginal)) {
      return NextResponse.json({ error: 'Monto no válido' }, { status: 400 });
    }

    // Llamar al backend real
    const response = await fetch(`${BACKEND_URL}/api/transacciones/${transaccionId}/cupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, totalOriginal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al aplicar cupón');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error al aplicar cupón:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}