import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.RECOMENDACIONES_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/recomendaciones/ordenar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {})
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error en proxy de ordenar:', error)
    return NextResponse.json(
      { success: false, error: 'Error al ordenar' },
      { status: 500 }
    )
  }
}