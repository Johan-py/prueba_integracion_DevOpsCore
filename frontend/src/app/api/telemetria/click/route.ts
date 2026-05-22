import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization')
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/telemetria/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {})
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error en proxy de telemetria/click:', error)
    return NextResponse.json({ success: false, error: 'Error al registrar click' }, { status: 500 })
  }
}
