import React from 'react';

const HeaderPanel: React.FC = () => {
  return (
    /* Añadimos flex y justify-between para que los botones se vayan a la derecha */
    <div className="w-full py-4 px-4 border-b border-border mb-4 flex justify-between items-center bg-white">
      
      {/* LO QUE HICIMOS AYER (DÍA 1) */}
      <div>
        <h1 className="text-xl font-extrabold text-foreground">
          Lista de inmuebles
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          3 propiedades encontradas
        </p>
      </div>

      {/* LO QUE TOCA HOY (DÍA 2 - T3) */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {/* Botón Vista Cuadritos */}
        <button 
          className="p-2 bg-white shadow-sm rounded-md hover:bg-gray-50 transition-all"
          title="Vista Grilla"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        {/* Botón Vista Lista */}
        <button 
          className="p-2 hover:bg-gray-200 rounded-md transition-all"
          title="Vista Lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeaderPanel;