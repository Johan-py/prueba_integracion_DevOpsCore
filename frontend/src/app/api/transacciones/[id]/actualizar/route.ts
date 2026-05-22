import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const authHeader = request.headers.get('Authorization');
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/api/transacciones/${id}/actualizar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.json({ error: 'Error al actualizar transacción' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
