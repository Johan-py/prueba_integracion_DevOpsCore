import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 tracking-tight hover:opacity-80 transition p-1"
    >
      {/* Logo SVG Vectorial */}
      <svg 
        width="36" 
        height="36" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Edificio de fondo (Negro) */}
        <path 
          d="M26 34V8a2 2 0 00-2-2H16a2 2 0 00-2 2v26" 
          stroke="#111827" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Casa al frente (Ámbar) */}
        <path 
          d="M32 34V16L20 8l-12 8v18" 
          stroke="#E68B25" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Ventanitas del edificio */}
        <path d="M18 12h4M18 18h4" stroke="#111827" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Puerta de la casa */}
        <path d="M16 34V26a2 2 0 012-2h4a2 2 0 012 2v8" stroke="#E68B25" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Línea base */}
        <path d="M4 34h32" stroke="#111827" strokeWidth="3" strokeLinecap="round"/>
      </svg>

      {/* Texto de la marca */}
      <span>Prop<span className="text-[#E68B25]">Bol</span></span>
    </Link>
  );
}
