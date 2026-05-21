import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_URL}/api/transacciones/${id}/cancelar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.json({ error: 'Error al cancelar transacción' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
