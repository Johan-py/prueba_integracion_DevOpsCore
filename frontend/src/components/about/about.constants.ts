export const aboutImages = {
  advisoryTeam:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  boliviaCity:
    'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80',
  familyHome:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
}

export const introSections = [
  {
    accent: 'Bolivia',
    paragraphs: [
      'PropBol es una inmobiliaria boliviana que acompana a personas y familias en decisiones importantes: comprar, alquilar, ofertar en anticretico o publicar un inmueble con informacion clara y cercana.',
      'Nacimos para conectar oportunidades reales con quienes buscan dar el siguiente paso con confianza, sin perder de vista el contexto local de cada ciudad y cada barrio.'
    ],
    title: 'Una plataforma hecha para'
  },
  {
    accent: 'historia',
    paragraphs: [
      'Empezamos observando un problema concreto: encontrar vivienda o invertir en Bolivia podia ser confuso, lento y poco transparente. Desde esa necesidad construimos una experiencia digital pensada para orientar mejor a cada persona.',
      'Hoy seguimos creciendo con una mirada simple: tecnologia util, acompanamiento humano y una forma de trabajo que prioriza confianza, claridad y decisiones bien informadas.'
    ],
    title: 'Nuestra'
  }
] as const

export const peopleSection = {
  accent: 'siempre',
  description:
    'En PropBol no tratamos cada operacion como un numero. Escuchamos el momento que vive cada cliente, entendemos sus prioridades y lo acompanamos hasta encontrar una opcion que realmente le sirva.',
  imageAlt: 'Equipo de trabajo asesorando clientes',
  imageSrc: aboutImages.advisoryTeam,
  title: 'Las personas primero,'
} as const

export const presenceSections = [
  {
    accent: 'Bolivia esta',
    paragraphs: [
      'De La Paz a Santa Cruz, de Cochabamba a Sucre, entendemos que cada mercado tiene ritmos, precios y necesidades distintas. Esa lectura local nos permite orientar mejor cada busqueda y cada publicacion.'
    ],
    title: 'Estamos donde'
  },
  {
    accent: 'en digital',
    paragraphs: [
      'Llevamos esa experiencia a un portal moderno y responsivo, pensado para que encuentres propiedades en venta, alquiler y anticretico, y puedas contactarte con nosotros desde cualquier dispositivo.'
    ],
    title: 'Hoy,'
  }
] as const
