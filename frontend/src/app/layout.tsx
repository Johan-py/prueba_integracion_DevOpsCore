import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: {
    default: 'PropBol',
    template: '%s | PropBol'
  },
  description:
    'PropBol es una inmobiliaria boliviana con un portal para comprar, alquilar, publicar y descubrir propiedades con información clara y confiable.',
  applicationName: 'PropBol',
  keywords: [
    'PropBol',
    'inmobiliaria boliviana',
    'propiedades en Bolivia',
    'casas en venta',
    'alquileres',
    'anticrético'
  ],
  robots: {
    follow: true,
    index: true
  },
  openGraph: {
    title: 'PropBol',
    description:
      'Portal inmobiliario boliviano para comprar, alquilar, publicar y descubrir propiedades.',
    locale: 'es_BO',
    siteName: 'PropBol',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    description:
      'Portal inmobiliario boliviano para comprar, alquilar, publicar y descubrir propiedades.',
    title: 'PropBol'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
