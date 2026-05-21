'use client'

import { useEffect, useState } from 'react'

export default function WelcomeToast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const msg = localStorage.getItem('welcome_message')
    if (msg) {
      setMessage(msg)
      localStorage.removeItem('welcome_message')
      const timer = setTimeout(() => setMessage(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0A66C2] px-5 py-3 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  )
}
