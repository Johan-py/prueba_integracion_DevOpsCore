'use client'

import { Facebook, Instagram } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo, { LogoMark } from '../navbar/Logo'

type FooterAction = {
  href?: string
  isExternal?: boolean
  label: string
  requiresAuth?: boolean
  id?: string
}

const exploreActions: FooterAction[] = [
  {
    label: 'En venta',
    href: '/busqueda_mapa?modoInmueble=VENTA',
    requiresAuth: true,
  },
  {
    label: 'Alquileres',
    href: '/busqueda_mapa?modoInmueble=ALQUILER',
    requiresAuth: true,
  },
  {
    label: 'Anticrético',
    href: '/busqueda_mapa?modoInmueble=ANTICRETO',
    requiresAuth: true,
  },
  {
    label: 'Publica tu inmueble',
    href: '/registro-inmueble',
    requiresAuth: true,
    id: 'tour-publicar',
  },
]

const companyActions: FooterAction[] = [
  { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
  { label: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
  { label: 'Políticas de Privacidad', href: '/politicas-privacidad' },
]

const socialActions: FooterAction[] = [
  {
    href: 'https://www.facebook.com/share/1DtBkxKBWf/',
    isExternal: true,
    label: 'Facebook',
  },
  {
    href: 'https://www.instagram.com/prop.bol?igsh=MWlsZzUwZWhtbDlwOA==',
    isExternal: true,
    label: 'Instagram',
  },
]

function scrollToHomeTop() {
  const startPosition = window.scrollY
  const duration = 700
  const startTime = performance.now()

  const animateScroll = (currentTime: number) => {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    window.scrollTo(0, Math.round(startPosition * (1 - easedProgress)))

    if (progress < 1) {
      window.requestAnimationFrame(animateScroll)
    }
  }

  window.requestAnimationFrame(animateScroll)
}

function FooterBrand() {
  const pathname = usePathname()

  return (
    <section id="tour-footer-logo" className="border-t border-amber-600 pt-4">
      <Logo
        className="w-fit"
        iconClassName="shadow-sm"
        iconSize={40}
        onClick={(event) => {
          if (pathname === '/') {
            event.preventDefault()
            scrollToHomeTop()
          }
        }}
        textClassName="text-[2rem] sm:text-[2.15rem]"
      />
      <p className="mt-4 max-w-xs text-sm leading-7 text-stone-600">
        Revolucionando el mercado inmobiliario con tecnología de punta y diseño centrado en el
        usuario.
      </p>
    </section>
  )
}

function FooterSection({
  actions,
  title,
  id,
}: {
  actions: FooterAction[]
  title: string
  id?: string
}) {
  const router = useRouter()

  const handleProtectedNavigation = (action: FooterAction) => {
    if (!action.href) return

    const token = localStorage.getItem('token')

    if (!token) {
      localStorage.setItem('redirectAfterLogin', action.href)
      router.push('/sign-in')
      return
    }

    router.push(action.href)
  }

  return (
    <section id={id} className="border-t border-amber-600 pt-4">
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>

      <ul className="mt-4 space-y-4">
        {actions.map((action) => (
          <li key={action.label}>
            {action.href && action.requiresAuth ? (
              <button
                id={action.id}
                type="button"
                data-confirm-exit="true"
                onClick={() => handleProtectedNavigation(action)}
                className="text-left text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                {action.label}
              </button>
            ) : action.href && !action.isExternal ? (
              <Link
                id={action.id}
                href={action.href}
                data-confirm-exit="true"
                className="text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                {action.label}
              </Link>
            ) : action.href ? (
              <a
                id={action.id}
                href={action.href}
                target={action.isExternal ? '_blank' : undefined}
                rel={action.isExternal ? 'noreferrer' : undefined}
                data-confirm-exit="true"
                className="text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                {action.label}
              </a>
            ) : (
              <button
                id={action.id}
                type="button"
                className="text-left text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                {action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function FooterBottomBar() {
  return (
    <div id="tour-footer-redes" className="border-t border-stone-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 text-sm text-stone-600 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <LogoMark className="rounded-md shadow-none" size={16} />
          <span>2026 PropBol Inmobiliaria.</span>
          <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden="true" />
          <span>Todos los derechos reservados</span>
        </div>

        <div className="flex items-center gap-3 text-stone-700">
          {socialActions.map((action) => {
            const Icon = action.label === 'Instagram' ? Instagram : Facebook

            return (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                aria-label={action.label}
                data-confirm-exit="true"
                className="transition-colors hover:text-amber-600"
              >
                <Icon size={18} strokeWidth={2} />
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  const pathname = usePathname()
  
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          <FooterBrand />

          <FooterSection
            id="tour-footer-explorar"
            actions={exploreActions}
            title="Explorar"
          />

          <FooterSection
            id="tour-footer-conocenos"
            actions={companyActions}
            title="Conócenos"
          />

          <FooterSection
            id="tour-footer-redes-texto"
            actions={socialActions}
            title="Redes Sociales"
          />
        </div>
      </div>

      <FooterBottomBar />
    </footer>
  )
}