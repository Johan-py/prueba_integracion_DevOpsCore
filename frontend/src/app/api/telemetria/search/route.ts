import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/telemetria/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error en proxy de telemetria/search:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar telemetría' },
      { status: 500 }
    )
  }
}
