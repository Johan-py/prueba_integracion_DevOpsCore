import Link from 'next/link'

export default function NavLinks() {
  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">
      <Link
        href="/"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Inicio
      </Link>

      <Link
        href="#contacto"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Contáctanos
      </Link>

      <Link
        href="#nosotros"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Sobre Nosotros
      </Link>
    </div>
  )
}
