import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'SOCIAL_IS | Premium Social Network',
  description: 'Arquitectura Screaming & UX de Clase Mundial'
}

// Mover estos componentes ANTES de RootLayout
const SidebarItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div
    className={`flex items-center space-x-4 px-4 py-3 rounded-xl cursor-not-allowed transition-all ${active ? 'bg-neutral-900 text-blue-500' : 'text-neutral-500 hover:bg-neutral-900/50 hover:text-neutral-300'}`}
  >
    <div
      className={`w-5 h-5 rounded ${active ? 'bg-blue-500/20 text-blue-500' : 'bg-neutral-800'}`}
    />
    <span className="text-sm font-semibold">{label}</span>
  </div>
)

const TrendingItem = ({ tag, posts }: { tag: string; posts: string }) => (
  <div className="group cursor-not-allowed">
    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Trending</p>
    <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">{tag}</p>
    <p className="text-[10px] text-neutral-500">{posts} posts</p>
  </div>
)

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 flex gap-8">
          {/* Left Sidebar - Desktop Hidden on Mobile */}
          <aside className="hidden lg:flex flex-col w-[240px] sticky top-[72px] h-[calc(100vh-80px)] py-4">
            <nav className="space-y-1">
              <SidebarItem label="Inicio" active />
              <SidebarItem label="Explorar" />
              <SidebarItem label="Notificaciones" />
              <SidebarItem label="Mensajes" />
              <SidebarItem label="Perfil" />
            </nav>
          </aside>

          {/* Main Feed Column */}
          <main className="flex-1 flex justify-center py-4 overflow-x-hidden">
            <div className="w-full max-w-[500px]">{children}</div>
          </main>

          {/* Right Sidebar / Widgets */}
          <aside className="hidden xl:flex flex-col w-[300px] sticky top-[72px] h-[calc(100vh-80px)] py-4 space-y-6">
            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-neutral-800/50">
              <h3 className="text-sm font-bold mb-4 tracking-tight">Tendencias para ti</h3>
              <div className="space-y-4">
                <TrendingItem tag="#SoftwareArchitecture" posts="1.2k" />
                <TrendingItem tag="#BunRuntime" posts="842" />
                <TrendingItem tag="#CleanCode" posts="2.3k" />
              </div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  )
}
