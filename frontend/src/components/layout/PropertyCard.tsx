"use client";
export default function PropertyCard() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-sm border border-gray-100">
      
      {/* 1. Contenedor de la Imagen con la etiqueta naranja */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"
          alt="Casa en venta"
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
          EN VENTA
        </span>
      </div>

      {/* 2. Contenido de la Tarjeta */}
      <div className="p-4">
        {/* Precio Inventado */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">$us 189.000</h2>
        
        {/* Descripción */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium">
          Casa Obra Gruesa Sobre terreno de 272m2 en Urbanización Bisa, Zona La Tamborada
        </p>

        {/* 3. Detalles (Camas, Baños, Metros) - Puse emojis por ahora para simular los íconos */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-4">
          <span className="flex items-center gap-1 text-orange-500">🛏️ 4</span>
          <span className="flex items-center gap-1 text-orange-500">🛁 3</span>
          <span className="flex items-center gap-1 text-gray-400">📐 272 m²</span>
        </div>

        {/* 4. Botón verde (Solo visual por hoy) */}
        <button className="w-full bg-[#1db954] hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
          <span>💬</span> Contactar
        </button>
      </div>
      
    </div>
  );
}