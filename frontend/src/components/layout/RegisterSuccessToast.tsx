'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

const STORAGE_KEY = 'register_success_message'
const TOAST_DURATION_MS = 5000

export default function RegisterSuccessToast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedMessage = sessionStorage.getItem(STORAGE_KEY)

    if (savedMessage) {
      setMessage(savedMessage)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!message) return

    const timeout = window.setTimeout(() => {
      setMessage('')
    }, TOAST_DURATION_MS)

    return () => window.clearTimeout(timeout)
  }, [message])

  if (!message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex min-w-[280px] items-start gap-3 border-l-4 border-emerald-400 bg-white px-4 py-3 shadow-lg">
      <CheckCircle className="mt-0.5 text-emerald-500" size={18} />
      <div>
        <p className="text-sm font-semibold text-[#292524]">Éxito</p>
        <p className="text-xs text-[#57534e]">{message}</p>
      </div>
    </div>
  )
}
