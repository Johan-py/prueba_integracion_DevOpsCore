export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass h-14">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white text-[10px] font-black">S</span>
          </div>
          <span className="text-lg font-black tracking-tighter italic text-white leading-none">
            SOCIAL_IS
          </span>
        </div>

        {/* Global Search Mockup */}
        <div className="hidden md:flex flex-1 max-w-md px-12">
          <div className="w-full relative">
            <input
              disabled
              type="text"
              placeholder="Buscar en la red..."
              className="w-full bg-neutral-900/80 border border-neutral-800/60 rounded-lg py-1.5 px-4 text-xs text-neutral-400 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-neutral-900/40 border border-neutral-800/50">
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 pr-1">arquitecto_is</span>
        </div>
      </div>
    </nav>
  )
}
