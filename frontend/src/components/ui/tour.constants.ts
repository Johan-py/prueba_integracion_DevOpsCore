export const TOUR_STEPS = [
  {
    id: "tour-banner",
    title: "¡Bienvenido a PropBol!",
    description: "Aquí encontrarás las propiedades destacadas del momento.",
    required: false,
  },
  {
    id: "tour-logo",
    title: "Logo - Inicio",
    description: "Haz clic en el logo para volver a la página principal.",
    required: true,
  },
  {
    id: "tour-propiedades",
    mobileId: "tour-propiedades-mobile",
    requiresMobileMenu: true,
    title: "Propiedades",
    description: "Explora casas, departamentos, terrenos y más.",
    required: true,
  },
  {
    id: "tour-blogs",
    mobileId: "tour-blogs-mobile",
    requiresMobileMenu: true,
    title: "Blogs",
    description: "Lee artículos y consejos sobre el mercado inmobiliario.",
    required: true,
  },
  {
    id: "tour-planes",
    mobileId: "tour-planes-mobile",
    requiresMobileMenu: true,
    title: "Planes de membresía",
    description: "Conoce nuestros planes y beneficios para publicar tu inmueble.",
    required: true,
  },
  {
    id: "tour-ayuda",
    mobileId: "tour-ayuda-mobile",
    requiresMobileMenu: true,
    title: "Ayuda",
    description: "Vuelve a ver este tour cuando quieras desde aquí.",
    required: true,
  },
  {
    id: "tour-buscador",
    mobileId: "tour-buscador-mobile",
    title: "Buscador de propiedades",
    description:
      "Filtra por tipo de operación (Venta, Alquiler o Anticrético), elige el tipo de inmueble y escribe una ubicación para encontrar la propiedad ideal.",
    required: true,
  },
  {
    id: "tour-filtros-visuales",
    title: "Explora por ciudad y tipo",
    description:
      "Aquí puedes ver propiedades en alquiler o venta agrupadas por departamento, y también explorar por tipo de inmueble: casas, departamentos, oficinas y terrenos.",
    required: true,
  },
  {
    id: "tour-publicar-home",
    mobileId: "tour-publicar-home-mobile",
    requiresMobileMenu: true,
    title: "Publica tu inmueble",
    description:
      "¿Tienes una propiedad para vender o alquilar? Haz clic aquí para registrar tu inmueble y llegar a miles de compradores e inquilinos.",
    required: true,
  },
  {
    id: "tour-notificaciones",
    title: "Notificaciones",
    description: "Aquí aparecerán tus alertas y novedades importantes.",
    required: true,
  },
  {
    id: "tour-user",
    title: "Tu cuenta",
    description: "Accede a tu perfil, publicaciones y configuración.",
    required: true,
  },
  {
    id: "tour-footer-logo",
    title: "PropBol",
    description: "Nuestra misión: revolucionar el mercado inmobiliario en Bolivia.",
    required: true,
  },
  {
    id: "tour-footer-explorar",
    title: "Explorar propiedades",
    description: "Encuentra inmuebles en venta, alquiler o anticrético.",
    required: true,
  },
  {
    id: "tour-footer-conocenos",
    title: "Conócenos",
    description: "Accede a información sobre nosotros, términos y políticas de privacidad.",
    required: true,
  },
  {
    id: "tour-footer-redes",
    title: "Redes Sociales",
    description: "Síguenos en Facebook e Instagram para estar al tanto de las novedades.",
    required: true,
  },
] as const

export const FOOTER_STEP_INDEX = 11
export const MENU_CLOSE_TIMEOUT_MS = 600