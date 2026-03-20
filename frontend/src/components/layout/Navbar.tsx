import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PropBol
          </Link>

          <div className="space-x-4">
            <Link href="/" className="hover:text-blue-600 transition">
              Inicio
            </Link>
            {/* Agrega más links según necesites */}
          </div>
        </div>
      </div>
    </nav>
  )
}
