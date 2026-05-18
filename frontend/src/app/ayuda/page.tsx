"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  FileText,
  Star,
  HelpCircle,
  Search,
  Map,
  PlusCircle,
  Bell,
  User,
  Building2,
  Compass,
  Info,
  Share2,
} from "lucide-react";

const PASOS = [
  {
    icon: Home,
    title: "¡Bienvenido a PropBol!",
    description: "Aquí encontrarás las propiedades destacadas del momento.",
  },
  {
    icon: Building2,
    title: "Logo - Inicio",
    description: "Haz clic en el logo para volver a la página principal.",
  },
  {
    icon: LayoutGrid,
    title: "Propiedades",
    description: "Explora casas, departamentos, terrenos y más.",
  },
  {
    icon: FileText,
    title: "Blogs",
    description: "Lee artículos y consejos sobre el mercado inmobiliario.",
  },
  {
    icon: Star,
    title: "Planes de membresía",
    description: "Conoce nuestros planes y beneficios para publicar tu inmueble.",
  },
  {
    icon: HelpCircle,
    title: "Ayuda",
    description: "Vuelve a ver este tour cuando quieras desde aquí.",
  },
  {
    icon: Search,
    title: "Buscador de propiedades",
    description:
      "Filtra por tipo de operación (Venta, Alquiler o Anticrético), elige el tipo de inmueble y escribe una ubicación para encontrar la propiedad ideal.",
  },
  {
    icon: Map,
    title: "Explora por ciudad y tipo",
    description:
      "Aquí puedes ver propiedades en alquiler o venta agrupadas por departamento, y también explorar por tipo de inmueble: casas, departamentos, oficinas y terrenos.",
  },
  {
    icon: PlusCircle,
    title: "Publica tu inmueble",
    description:
      "¿Tienes una propiedad para vender o alquilar? Haz clic aquí para registrar tu inmueble y llegar a miles de compradores e inquilinos.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Aquí aparecerán tus alertas y novedades importantes.",
  },
  {
    icon: User,
    title: "Tu cuenta",
    description: "Accede a tu perfil, publicaciones y configuración.",
  },
  {
    icon: Building2,
    title: "PropBol",
    description: "Nuestra misión: revolucionar el mercado inmobiliario en Bolivia.",
  },
  {
    icon: Compass,
    title: "Explorar propiedades",
    description: "Encuentra inmuebles en venta, alquiler o anticrético.",
  },
  {
    icon: Info,
    title: "Conócenos",
    description:
      "Accede a información sobre nosotros, términos y políticas de privacidad.",
  },
  {
    icon: Share2,
    title: "Redes Sociales",
    description:
      "Síguenos en Facebook e Instagram para estar al tanto de las novedades.",
  },
];

export default function AyudaPage() {
  const router = useRouter();

  const iniciarTour = () => {
    if (window.location.pathname === "/") {
      window.dispatchEvent(new Event("propbol:iniciar-tour"));
    } else {
      router.push("/");
      setTimeout(() => {
        window.dispatchEvent(new Event("propbol:iniciar-tour"));
      }, 500);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-14 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E68B25]/10 mb-4">
          <HelpCircle className="w-8 h-8 text-[#E68B25]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100 mb-2">Centro de Ayuda</h1>
        <p className="text-gray-500 dark:text-stone-400 max-w-md mx-auto mb-8">
          Conoce todas las funciones de PropBol con nuestro tour guiado interactivo.
        </p>
        <button
          onClick={iniciarTour}
          className="inline-flex items-center gap-2 bg-[#E68B25] hover:bg-[#d07b1f] text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-md"
        >
          Iniciar tour guiado
        </button>
      </section>

      {/* Pasos del tour */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-stone-300 mb-6">
          ¿Qué encontrarás en el tour?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PASOS.map((paso, index) => {
            const Icon = paso.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex gap-4 items-start hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E68B25]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#E68B25]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-stone-200 mb-1">
                    {paso.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-stone-400 leading-relaxed">
                    {paso.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={iniciarTour}
            className="inline-flex items-center gap-2 bg-[#E68B25] hover:bg-[#d07b1f] text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-md"
          >
            Iniciar tour guiado
          </button>
        </div>
      </section>
    </main>
  );
}
