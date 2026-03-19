export const Stories = () => {
  return (
    <section className="mb-6 w-full select-none">
      <div className="flex space-x-4 overflow-x-auto py-1 hide-scrollbar">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 flex flex-col items-center space-y-2 group cursor-not-allowed"
          >
            <div className="relative w-[60px] h-[60px] rounded-full p-[2px] ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all">
              <div className="w-full h-full rounded-full bg-neutral-900 p-[2px]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 flex items-center justify-center overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/200/center"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-600 opacity-60"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              {/* Active Indicator Dot */}
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-500 tracking-tight group-hover:text-neutral-300 transition-colors">
              Grupo {i}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
