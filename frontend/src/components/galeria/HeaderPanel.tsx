'use client'
import React, { useState } from 'react'

const HeaderPanel = () => {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')

  return (
    // Se agregó dark:bg-gray-800 para el fondo del contenedor en modo oscuro
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm shrink-0">
      <button
        onClick={() => setActiveView('grid')}
        className={`p-1.5 rounded-md transition-all ${
          activeView === 'grid'
            // Se agregaron colores oscuros para el estado activo
            ? 'bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
            // Se agregaron colores oscuros para el hover y texto inactivo
            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400'
        }`}
        title="Vista Grilla"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={activeView === 'grid' ? '#ea580c' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>

      <button
        onClick={() => setActiveView('list')}
        className={`p-1.5 rounded-md transition-all ${
          activeView === 'list'
             // Se agregaron colores oscuros para el estado activo
            ? 'bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
             // Se agregaron colores oscuros para el hover y texto inactivo
            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400'
        }`}
        title="Vista Lista"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={activeView === 'list' ? '#ea580c' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}

export default HeaderPanel