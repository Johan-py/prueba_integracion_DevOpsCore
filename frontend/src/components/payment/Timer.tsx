"use client";

import React from "react";

interface TimerProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export function Timer({ timeLeft, formatTime }: TimerProps) {
  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`rounded-lg p-3 text-center transition-colors ${
        isUrgent ? "bg-red-50 dark:bg-red-950" : "bg-stone-50 dark:bg-stone-800"
      }`}
    >
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Tiempo restante para completar el pago
      </p>
      <div className="flex items-center justify-center gap-2 mt-1">
        {/* Ícono de reloj SVG */}
        <svg
          className={`w-6 h-6 ${isUrgent ? "text-red-600" : "text-stone-900 dark:text-stone-100"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          className={`text-3xl font-mono font-bold ${
            isUrgent ? "text-red-600" : "text-stone-900 dark:text-stone-100"
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}
