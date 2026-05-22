import type { AdminModerationBlog } from '@/types/adminModerationBlog'

export const ADMIN_MODERATION_BLOGS_MOCK: AdminModerationBlog[] = [
  {
    id: 'admin-blog-1',
    title: 'Las 10 mejores inversiones en Santa Cruz',
    category: 'Mercado inmobiliario',
    authorName: 'Carlos Mendoza',
    authorRole: 'Autor invitado',
    submittedAt: '2026-10-24T09:00:00.000Z',
    readingTime: '8 min',
    coverImage:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Un repaso por zonas emergentes, tipologias con mejor retorno y senales de demanda sostenida para el cierre de gestion.',
    lead: 'Santa Cruz mantiene un ritmo de crecimiento que vuelve especialmente atractivas las inversiones residenciales y mixtas en corredores con alta conectividad.',
    sections: [
      {
        heading: 'Por que Santa Cruz sigue liderando',
        paragraphs: [
          'El dinamismo economico de la ciudad impulsa nuevos desarrollos y una demanda constante por vivienda, oficinas y espacios flexibles.',
          'Los compradores valoran proyectos con acceso rapido, servicios consolidados y un lenguaje arquitectonico contemporaneo que eleve la percepcion de valor.'
        ]
      },
      {
        heading: 'Zonas a observar en 2026',
        paragraphs: [
          'Equipetrol ampliado, Urubo y ciertos sectores del norte muestran una mezcla saludable entre plusvalia, absorcion y oferta diferenciada.',
          'La clave para el inversionista es detectar proyectos con narrativa clara de producto y no solo competir por precio.'
        ]
      }
    ],
    status: 'PENDIENTE',
    rejectionComment: null,
    reviewedAt: null
  },
  {
    id: 'admin-blog-2',
    title: 'Tendencias de Arquitectura 2024',
    category: 'Arquitectura',
    authorName: 'Lucia Fernandez',
    authorRole: 'Colaboradora',
    submittedAt: '2026-10-23T09:00:00.000Z',
    readingTime: '6 min',
    coverImage:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Materiales honestos, espacios serenos y eficiencia energetica se combinan para definir una nueva sensibilidad urbana.',
    lead: 'La arquitectura contemporanea esta abandonando el exceso ornamental para priorizar luz natural, proporciones limpias y experiencia espacial.',
    sections: [
      {
        paragraphs: [
          'El minimalismo calido gana terreno gracias a interiores que combinan concreto visto, madera y textiles de alta textura.',
          'Las soluciones modulares y la ventilacion cruzada vuelven a ocupar un lugar central en proyectos de vivienda y hoteleria.'
        ]
      },
      {
        heading: 'Una estetica con criterio funcional',
        paragraphs: [
          'Las propuestas mas solidas no persiguen solo imagen; tambien mejoran mantenimiento, flexibilidad de uso y rendimiento termico.'
        ]
      }
    ],
    status: 'PENDIENTE',
    rejectionComment: null,
    reviewedAt: null
  },
  {
    id: 'admin-blog-3',
    title: 'Guia para compradores primerizos',
    category: 'Educacion financiera',
    authorName: 'Roberto Gomez',
    authorRole: 'Especialista inmobiliario',
    submittedAt: '2026-10-22T09:00:00.000Z',
    readingTime: '7 min',
    coverImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Una guia clara sobre presupuesto, validacion legal y criterios practicos para tomar una primera decision de compra con mas confianza.',
    lead: 'Comprar la primera propiedad suele venir acompanado de dudas sobre financiamiento, ubicacion y documentacion, por eso la informacion debe ser precisa y aterrizada.',
    sections: [
      {
        paragraphs: [
          'El primer filtro debe ser el presupuesto real: cuota mensual sostenible, gastos notariales y fondo para mantenimiento.',
          'Tambien conviene validar el historial del inmueble y revisar si la ubicacion acompana las necesidades familiares o laborales del comprador.'
        ]
      }
    ],
    status: 'PENDIENTE',
    rejectionComment: null,
    reviewedAt: null
  },
  {
    id: 'admin-blog-4',
    title: 'Diseno de interiores: minimalismo calido',
    category: 'Interiorismo',
    authorName: 'Sofia Arteaga',
    authorRole: 'Disenadora invitada',
    submittedAt: '2026-10-21T09:00:00.000Z',
    readingTime: '5 min',
    coverImage:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Como combinar tonos neutros, capas tactiles y piezas funcionales para lograr espacios habitables y sofisticados.',
    lead: 'El minimalismo calido propone bajar el ruido visual sin renunciar a la sensacion de hogar, usando materiales nobles y una composicion contenida.',
    sections: [
      {
        paragraphs: [
          'La seleccion de mobiliario prioriza lineas limpias, almacenamiento discreto y circulacion generosa.',
          'La iluminacion indirecta y los acentos organicos ayudan a construir profundidad sin recargar el ambiente.'
        ]
      }
    ],
    status: 'PENDIENTE',
    rejectionComment: null,
    reviewedAt: null
  },
  {
    id: 'admin-blog-5',
    title: 'Como preparar una propiedad para fotografia profesional',
    category: 'Marketing inmobiliario',
    authorName: 'Valeria Paredes',
    authorRole: 'Editora',
    submittedAt: '2026-10-19T09:00:00.000Z',
    readingTime: '4 min',
    coverImage:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Orden visual, luz y puesta en escena pueden cambiar por completo la percepcion de valor de una propiedad publicada.',
    lead: 'Una buena sesion fotografica comienza mucho antes de encender la camara: limpieza, estilismo ligero y recorrido narrativo son decisivos.',
    sections: [
      {
        paragraphs: [
          'Cuando la propiedad comunica amplitud, mantenimiento y claridad funcional, los anuncios elevan su tasa de interes de forma inmediata.'
        ]
      }
    ],

    status: 'PUBLICADO',

    rejectionComment: null,
    reviewedAt: '2026-10-20T12:15:00.000Z'
  },
  {
    id: 'admin-blog-6',
    title: 'Errores comunes al fijar el precio de venta',
    category: 'Mercado inmobiliario',
    authorName: 'Daniel Roca',
    authorRole: 'Analista',
    submittedAt: '2026-10-18T09:00:00.000Z',
    readingTime: '5 min',
    coverImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
    excerpt:
      'Sobrevalorar por expectativa emocional o subvalorar por urgencia son dos fallas que pueden deteriorar toda la estrategia comercial.',
    lead: 'Una publicacion creible parte de un precio consistente con zona, metraje, estado del inmueble y comparables recientes.',
    sections: [
      {
        paragraphs: [
          'Cuando el precio no dialoga con el mercado, el inmueble pierde traccion y termina compitiendo en desventaja aun despues de rebajas.'
        ]
      }
    ],
    status: 'RECHAZADO',
    rejectionComment:
      'El articulo necesita fuentes mas claras y una conclusion accionable antes de publicarse.',
    reviewedAt: '2026-10-18T18:40:00.000Z'
  }
]
