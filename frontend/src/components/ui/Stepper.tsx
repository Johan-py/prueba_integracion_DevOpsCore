'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Step {
  id: number
  name: string
  path: string
}

interface StepperProps {
  onBackClick?: () => void
}

const steps: Step[] = [
  { id: 1, name: 'Resumen', path: '/pago/resumen' },
  { id: 2, name: 'Pagar', path: '/pago/qr' },
  { id: 3, name: 'Confirmación', path: '/pago/confirmacion' }
]

export default function Stepper({ onBackClick }: StepperProps = {}) {
  const pathname = usePathname()
  
  // Encontramos el paso actual. Si por alguna razón falla, por defecto es 1.
  const foundIndex = steps.findIndex((step) => pathname.startsWith(step.path))
  const currentStep = foundIndex !== -1 ? foundIndex + 1 : 1

  return (
    <div className="flex items-center justify-end space-x-2 text-sm">
      {steps.map((step, idx) => {
        // Variables para que la lógica quede súper clara
        const isPast = step.id < currentStep
        const isCurrent = step.id === currentStep
        const isFuture = step.id > currentStep

        // Clases de Tailwind para el círculo dependiendo de su estado
        const circleClasses = `flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          isCurrent
            ? 'bg-green-500 text-white'
            : isPast
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 hover:shadow-sm'
              : 'bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#666] cursor-not-allowed opacity-70'
        }`

        return (
          <div key={step.id} className="flex items-center">
            
            {/* RENDERIZADO CONDICIONAL: Solo los pasos pasados tienen Link */}
            {isPast ? (
              onBackClick ? (
                <button onClick={onBackClick} className={circleClasses} title="Volver a este paso">
                  {step.id}
                </button>
              ) : (
                <Link href={step.path} className={circleClasses} title="Volver a este paso">
                  {step.id}
                </Link>
              )
            ) : (
              <div className={circleClasses} title={isFuture ? "Paso bloqueado" : ""}>
                {step.id}
              </div>
            )}
            
            {/* Etiqueta de texto (Nombre del paso) */}
            <span
              className={`ml-2 ${
                isCurrent ? 'font-bold text-green-600' : 'text-gray-500 dark:text-[#999]'
              } ${isFuture ? 'opacity-50' : ''}`}
            >
              {step.name}
            </span>
            
            {/* Flecha separadora */}
            {idx < steps.length - 1 && <span className="mx-2 text-gray-300 dark:text-[#555]">→</span>}
          </div>
        )
      })}
    </div>
  )
}
