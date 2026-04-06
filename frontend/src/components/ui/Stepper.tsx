"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface Step {
  id: number;
  name: string;
  path: string;
}

const steps: Step[] = [
  { id: 1, name: "Resumen", path: "/pago/resumen" },
  { id: 2, name: "Pagar", path: "/pago/qr" },
  { id: 3, name: "Confirmación", path: "/pago/confirmacion" },
];

export default function Stepper() {
  const pathname = usePathname();
  const currentStep =
    steps.findIndex((step) => pathname.startsWith(step.path)) + 1;

  return (
    <div className="flex items-center justify-end space-x-2 text-sm">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <Link
            href={step.path}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              step.id === currentStep
                ? "bg-green-600 text-white"
                : step.id < currentStep
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {step.id}
          </Link>
          <span
            className={`ml-2 ${
              step.id === currentStep
                ? "font-bold text-gray-900"
                : "text-gray-500"
            }`}
          >
            {step.name}
          </span>
          {idx < steps.length - 1 && (
            <span className="mx-2 text-gray-300">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
