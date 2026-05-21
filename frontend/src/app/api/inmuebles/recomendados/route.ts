import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.RECOMENDACIONES_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const queryString = searchParams.toString()

    const token = req.headers.get('authorization')

    const response = await fetch(`${BACKEND_URL}/api/recomendaciones/inmuebles?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {})
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error en proxy de recomendados:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener resultados' },
      { status: 500 }
    )
  }
}
