'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type FooterAction = {
  href?: string
  isExternal?: boolean
  label: string
}

const exploreActions: FooterAction[] = [
  { label: 'Comprar Propiedad' }, // TODO: users -> '/propiedades/en-venta' | visitors -> '/auth/login'
  { label: 'Alquilar Inmueble' }, // TODO: users -> '/propiedades/alquiler' | visitors -> '/auth/login'
  { label: 'Anticrético' }, // TODO: users -> '/propiedades/anticretico' | visitors -> '/auth/login'
  { label: 'Publica tu inmueble' } // TODO: users -> '/publicar' | visitors -> '/auth/login'
]

const companyActions: FooterAction[] = [
  { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
  { label: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
  { label: 'Políticas de Privacidad', href: '/politicas-privacidad' }
]

const socialActions: FooterAction[] = [
  {
    href: 'https://www.facebook.com/share/1DtBkxKBWf/',
    isExternal: true,
    label: 'Facebook'
  },
  {
    href: 'https://www.instagram.com/prop.bol?igsh=MWlsZzUwZWhtbDlwOA==',
    isExternal: true,
    label: 'Instagram'
  }
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
    <section className="border-t border-amber-600 pt-4">
      <Link
        href="/"
        onClick={(event) => {
          if (pathname === '/') {
            event.preventDefault()
            scrollToHomeTop()
          }
        }}
        className="inline-flex items-center gap-3 transition-colors hover:text-amber-600"
      >
        <Image src="/icons/temp-icon.svg" alt="Logo temporal de PropBol" width={44} height={44} />
        <span className="text-2xl font-bold text-stone-900">PropBol</span>
      </Link>
      <p className="mt-4 max-w-xs text-sm leading-8 text-stone-600">
        Revolucionando el mercado inmobiliario con tecnología de punta y diseño centrado en el
        usuario.
      </p>
    </section>
  )
}

function FooterSection({ actions, title }: { actions: FooterAction[]; title: string }) {
  return (
    <section className="border-t border-amber-600 pt-4">
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      <ul className="mt-4 space-y-4">
        {actions.map((action) => (
          <li key={action.label}>
            {action.href ? (
              <a
                href={action.href}
                target={action.isExternal ? '_blank' : undefined}
                rel={action.isExternal ? 'noreferrer' : undefined}
                className="text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                {action.label}
              </a>
            ) : (
              <button
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
    <div className="border-t border-stone-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-sm text-stone-600 sm:flex-row sm:flex-wrap sm:items-center sm:px-8 lg:px-10">
        <span className="h-4 w-4 rounded-md border border-stone-400" aria-hidden="true" />
        <span>2026 PropBol Inmobiliaria.</span>
        <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden="true" />
        <span>Todos los derechos reservados</span>
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          <FooterBrand />
          <FooterSection actions={exploreActions} title="Explorar" />
          <FooterSection actions={companyActions} title="Conócenos" />
          <FooterSection actions={socialActions} title="Redes Sociales" />
        </div>
      </div>
      <FooterBottomBar />
    </footer>
  )
}
