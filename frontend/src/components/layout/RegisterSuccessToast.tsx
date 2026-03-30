'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function RegisterSuccessToast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedMessage = sessionStorage.getItem('register_success_message')

    if (!savedMessage) return

    setMessage(savedMessage)
    sessionStorage.removeItem('register_success_message')

    const timeout = window.setTimeout(() => {
      setMessage('')
    }, 3500)

    return () => window.clearTimeout(timeout)
  }, [])

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
