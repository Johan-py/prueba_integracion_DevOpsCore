import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import TelemetryTrigger from "@/components/profile/TelemetryTrigger"; // Importamos el activador de la HU-11
import ThemeProvider from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "PropBol",
    template: "%s | PropBol",
  },
  description:
    "PropBol es una inmobiliaria boliviana con un portal para comprar, alquilar, publicar y descubrir propiedades con información clara y confiable.",
  applicationName: "PropBol",
  keywords: [
    "PropBol",
    "inmobiliaria boliviana",
    "propiedades en Bolivia",
    "casas en venta",
    "alquileres",
    "anticrético",
  ],
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    title: "PropBol",
    description:
      "Portal inmobiliario boliviano para comprar, alquilar, publicar y descubrir propiedades.",
    locale: "es_BO",
    siteName: "PropBol",
    type: "website",
  },
  twitter: {
    card: "summary",
    description:
      "Portal inmobiliario boliviano para comprar, alquilar, publicar y descubrir propiedades.",
    title: "PropBol",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head> 
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('propbol-theme');if(t==='dark')document.documentElement.classList.add('dark');var a=localStorage.getItem('propbol-accessibility');if(a&&a!=='none')document.documentElement.setAttribute('data-accessibility',a);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider defaultTheme="light">
          {/* El AppShell envuelve el contenido principal */}
          <AppShell>{children}</AppShell>
          
        {/* Inyectamos el TelemetryTrigger fuera del AppShell 
          para que controle el retraso de 4 segundos y la 
          captura automática de zona sin interferir con la UI 
        */}
        <TelemetryTrigger />
        </ThemeProvider>
      </body>
    </html>
  );
}