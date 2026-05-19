import { NextResponse } from 'next/server'

// Usa URL de producción en Vercel, o localhost en desarrollo
const BACKEND = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://propbol-all-services.onrender.com')
  : (process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000')

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/zonas`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API/zonas-mapa] Error:', error)
    return NextResponse.json(
      { ok: false, data: [], mensaje: 'No se pudo obtener las zonas del mapa.' },
      { status: 502 }
    )
  }
}
