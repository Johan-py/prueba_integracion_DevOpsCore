import { Bell, User, Search } from "lucide-react"; // Instala lucide-react si no lo tienes

export default function HeaderPropio() {
  return (
    <header className="w-full flex items-center justify-between px-10 py-4 border-b border-gray-200 bg-white">
      {/* Logo Sigma */}
      <div className="flex items-center gap-2">
        <div className="bg-[#E67E22] p-2 rounded-lg text-white font-bold">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[#E67E22] text-2xl font-bold">Sigma</span>
      </div>

      {/* Menú Derecha */}
      <div className="flex items-center gap-8 text-gray-700 font-medium">
        <button className="hover:text-black">Inicio</button>
        <button className="relative">
          <Bell className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer border-l pl-8">
          <div className="bg-gray-200 rounded-full p-1">
            <User />
          </div>
          <span>Cuenta</span>
        </div>
      </div>
    </header>
  );
}
