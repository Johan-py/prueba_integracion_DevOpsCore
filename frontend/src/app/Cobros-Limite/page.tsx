'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

export default function Page() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [datosPlan, setDatosPlan] = useState({ total: 2, usadas: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)

    const token = localStorage.getItem('token')
    const payload = token ? jwtDecode<{ id?: number; sub?: number }>(token) : null
    const userId = payload?.id ?? payload?.sub

    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/publicaciones/free`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          const total = data.total ?? 2
          const restantes = data.restantes ?? 0
          setDatosPlan({ total, usadas: total - restantes })
          setCargando(false)
        })
        .catch((err) => console.error('Error:', err))
    }

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="absolute w-[92%] h-[88%] bg-[#d9d9d9]/40 dark:bg-[#111]/40 backdrop-blur-md rounded-2xl"></div>
      <div className="relative flex items-center justify-center w-full h-full">
        <div
          className={`bg-[#eeeeee] dark:bg-[#1a1a1a] rounded-2xl px-7 py-8 w-[360px] text-center shadow-md transform transition-all duration-300
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="text-red-500 text-2xl">🚫</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 dark:text-white leading-tight">Límite alcanzado</h2>

          <p className="text-sm text-gray-600 dark:text-[#999] mt-3 leading-relaxed px-2">
            Has alcanzado el límite de tus publicaciones gratuitas de este mes. Para continuar,
            amplía tu plan de membresía o revisa tus planes disponibles.
          </p>

          <div className="mt-5 bg-[#e5e5e5] dark:bg-[#222] rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-left">
              <p className="text-gray-700 dark:text-white text-sm">Tus publicaciones restantes:</p>
              <p className="text-red-500 font-semibold text-sm">
                {cargando
                  ? 'Cargando...'
                  : `${Math.max(datosPlan.total - datosPlan.usadas, 0)} de ${datosPlan.total} restantes`}
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-orange-200 dark:bg-orange-900/40 rounded-md">
              🔒
            </div>
          </div>

          <button
            onClick={() => router.push('/cobros-suscripciones')}
            className="mt-5 w-full py-2.5 rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600 transition"
          >
            💳 ¡Ver mis planes y ampliar cupo!
          </button>

          <button
            onClick={() => router.push('/mis-publicaciones')}
            className="mt-3 w-full py-2.5 rounded-lg border border-gray-400 dark:border-[#444] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333] transition"
          >
            🏠 Volver a mis publicaciones
          </button>
        </div>
      </div>
    </div>
  )
}
