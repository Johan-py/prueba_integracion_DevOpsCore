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

  const response = await fetch(`${BACKEND_URL}/api/transacciones/${id}/confirmar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({ error: 'Error de conexión con el servidor' }, { status: 503 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
