// components/CheckoutHeader.tsx
'use client';

import { CheckCircle } from 'lucide-react';

type Step = 'resumen' | 'pagar' | 'confirmacion';

interface CheckoutHeaderProps {
  currentStep: Step;
}

export default function CheckoutHeader({ currentStep }: CheckoutHeaderProps) {
  const steps = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'pagar', label: 'Pagar' },
    { id: 'confirmacion', label: 'Confirmación' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      {/* Título a la izquierda */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Resumen de Compra
      </h1>

      {/* Indicador de 3 estados */}
      <div className="flex items-center justify-start gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStepIndex > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStepIndex > index ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  text-sm font-medium
                  ${currentStep === step.id
                    ? 'text-blue-600'
                    : currentStepIndex > index
                    ? 'text-green-600'
                    : 'text-gray-500'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-px bg-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}