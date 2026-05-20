import { NextRequest, NextResponse } from 'next/server'

// Usa URL de producción en Vercel, o localhost en desarrollo
const BACKEND = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://propbol-all-services.onrender.com')
  : (process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000')

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const zonaId = searchParams.get('zonaId')
    const tipoOperacion = searchParams.get('tipoOperacion')

    if (!zonaId || !tipoOperacion) {
      return NextResponse.json(
        { ok: false, mensaje: 'Debes proporcionar zonaId y tipoOperacion.' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${BACKEND}/api/estadisticas-zona?zonaId=${zonaId}&tipoOperacion=${tipoOperacion}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API/estadisticas-zona] Error:', error)
    return NextResponse.json(
      { ok: false, mensaje: 'No se pudo conectar al servicio de estadísticas.' },
      { status: 502 }
    )
  }
}
