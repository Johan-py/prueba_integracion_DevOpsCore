'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const checkBrowserCompatibility = (): string | null => {
    if (typeof window === 'undefined') return null

    if (!window.fetch) return 'fetch'
    if (!window.sessionStorage) return 'sessionStorage'
    if (!window.Promise) return 'Promise'
    if (!window.CSS || !window.CSS.supports('display', 'grid')) return 'CSS Grid'
    if (!navigator.onLine && typeof navigator.onLine === 'undefined') return 'navigator.onLine'

    return null
}

export default function UnsupportedBrowserPage() {
    const router = useRouter()
    const [incompatibleFeature, setIncompatibleFeature] = useState<string | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
    const feature = checkBrowserCompatibility()
    setIncompatibleFeature(feature)
    setChecked(true)

    if (!feature) {
        router.replace('/sign-in')
    }
    }, [router])

    if (!checked) return null

    if (!incompatibleFeature) return null

    return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4 py-10">
        <div className="w-full max-w-sm">

        <div className="rounded-xl border border-[#e7e5e4] bg-white px-6 py-8 shadow-sm sm:px-8">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
            </svg>
            </div>

            <h1 className="text-center text-2xl font-bold text-[#292524] sm:text-3xl">
            Navegador no compatible
            </h1>

            <p className="mt-3 text-center text-sm leading-relaxed text-[#78716c]">
            Tu navegador no es compatible con PropBol. Para continuar, por favor usa una versión actualizada de alguno de estos navegadores:
            </p>

            <div className="my-6 border-t border-[#f0ede9]" />

            <ul className="space-y-3 text-sm text-[#57534e]">
            <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                ✓
                </span>
                Google Chrome
            </li>
            <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                ✓
                </span>
                Mozilla Firefox
            </li>
            <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                ✓
                </span>
                Microsoft Edge
            </li>
            <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                ✓
                </span>
                Safari
            </li>
            </ul>

            <div className="my-6 border-t border-[#f0ede9]" />

            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-center text-xs leading-relaxed text-red-700">
                Tu navegador no soporta{' '}
                <span className="font-semibold">{incompatibleFeature}</span>,
                necesario para el funcionamiento seguro del ingreso con enlace mágico.
            </p>
            </div>

        </div>

        <p className="mt-4 text-center text-xs text-[#a8a29e]">
            Si crees que esto es un error, intenta limpiar el caché de tu navegador.
        </p>

        </div>
    </div>
    )
}