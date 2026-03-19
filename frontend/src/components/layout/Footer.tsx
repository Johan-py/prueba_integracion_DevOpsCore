export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-900 bg-black py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded bg-blue-500" />
              <span className="font-black text-white italic">SOCIAL_IS</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
              La plataforma definitiva para ingenieros de software. Construida con Screaming
              Architecture y tecnologías de vanguardia.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-tighter">
              Recursos
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Proyectos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-tighter">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-600">
          <p>© 2026 SOCIAL_IS | Equipo Master IS</p>
          <div className="flex space-x-4">
            <span>V1.0.0</span>
            <span>Screaming Mode ON</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
