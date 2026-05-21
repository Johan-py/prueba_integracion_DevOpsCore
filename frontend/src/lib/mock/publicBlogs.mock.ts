import { BlogRow, PublicBlogCard, mapBlogRowToPublicBlogCard } from '@/types/publicBlog'

const MOCK_BLOG_ROWS: BlogRow[] = [
  {
    id: 1,
    titulo: 'El Auge del Brutalismo Biofilico',
    contenido: 'Contenido de ejemplo para el blog destacado de arquitectura.',
    resumen:
      'Descubra como los arquitectos lideres fusionan el concreto puro con ecosistemas internos para redefinir el lujo.',
    imagen:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-18T09:00:00.000Z',
    fecha_publicacion: '2026-04-18T10:00:00.000Z',
    usuario_id: 7,
    categoria_id: 2,
    categoria: {
      id: 2,
      nombre: 'Arquitectura'
    },
    usuario: {
      id: 7,
      nombre: 'Admin',
      apellido: 'PropBol'
    },
    destacado: true
  },
  {
    id: 2,
    titulo: 'Tendencias Globales: Ciudades Secundarias son el Nuevo Prime',
    contenido: 'Contenido de ejemplo para un blog de inversion.',
    resumen:
      'A medida que el trabajo remoto madura, el capital de inversion fluye hacia mercados secundarios de alta amenidad como nunca antes.',
    imagen:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-17T09:00:00.000Z',
    fecha_publicacion: '2026-04-17T10:00:00.000Z',
    usuario_id: 4,
    categoria_id: 1,
    categoria: {
      id: 1,
      nombre: 'Tendencias'
    },
    usuario: {
      id: 4,
      nombre: 'Julian',
      apellido: 'Thorne'
    }
  },
  {
    id: 3,
    titulo: 'Psicologia del Espacio: Menos es el Nuevo Mas',
    contenido: 'Contenido de ejemplo para un blog de interiorismo.',
    resumen:
      'Explorando como los espacios vacios intencionales impactan en el bienestar mental de los propietarios de alto patrimonio.',
    imagen:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-16T09:00:00.000Z',
    fecha_publicacion: '2026-04-16T10:00:00.000Z',
    usuario_id: 5,
    categoria_id: 3,
    categoria: {
      id: 3,
      nombre: 'Estilo de vida'
    },
    usuario: {
      id: 5,
      nombre: 'Elena',
      apellido: 'Rossi'
    }
  },
  {
    id: 4,
    titulo: 'Estancias Net-Zero: El Estandar para Visionarios',
    contenido: 'Contenido de ejemplo para un blog de sustentabilidad.',
    resumen:
      'Un analisis profundo de las propiedades autonomas de alta tecnologia que se construyen en el noroeste del Pacifico.',
    imagen:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-15T09:00:00.000Z',
    fecha_publicacion: '2026-04-15T10:00:00.000Z',
    usuario_id: 6,
    categoria_id: 4,
    categoria: {
      id: 4,
      nombre: 'Arquitectura'
    },
    usuario: {
      id: 6,
      nombre: 'Marcus',
      apellido: 'Chen'
    }
  },
  {
    id: 5,
    titulo: 'El Indice del Rascacielos: Prediciendo el Futuro Economico',
    contenido: 'Contenido de ejemplo para un blog adicional de inversion.',
    resumen:
      'Como las correlaciones historicas entre el crecimiento vertical y los ciclos del mercado estan informando a los inversionistas institucionales hoy.',
    imagen:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-13T09:00:00.000Z',
    fecha_publicacion: '2026-04-13T10:00:00.000Z',
    usuario_id: 7,
    categoria_id: 2,
    categoria: {
      id: 2,
      nombre: 'Arquitectura'
    },
    usuario: {
      id: 7,
      nombre: 'Julian',
      apellido: 'Thorne'
    }
  },
  {
    id: 6,
    titulo: 'Arquitectura Sensorial para una Nueva Generacion de Refugios',
    contenido: 'Contenido de ejemplo para un blog adicional de arquitectura.',
    resumen:
      'Texturas, luz natural y recorridos fluidos se estan usando para crear espacios que se sienten mas humanos y memorables.',
    imagen:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    estado: 'PUBLICADO',
    eliminado: false,
    fecha_creacion: '2026-04-12T09:00:00.000Z',
    fecha_publicacion: '2026-04-12T10:00:00.000Z',
    usuario_id: 8,
    categoria_id: 1,
    categoria: {
      id: 1,
      nombre: 'Tendencias'
    },
    usuario: {
      id: 8,
      nombre: 'Elena',
      apellido: 'Rossi'
    }
  }
]

export const MOCK_PUBLIC_BLOGS: PublicBlogCard[] = MOCK_BLOG_ROWS.map(mapBlogRowToPublicBlogCard)
  .filter((blog): blog is PublicBlogCard => blog !== null)
  .map((blog) => {
    if (blog.id === '1') {
      return {
        ...blog,
        featuredLabel: 'ARQUITECTURA DESTACADA',
        articleCtaLabel: 'LEER ARTICULO ->'
      }
    }

    if (blog.id === '2') {
      return {
        ...blog,
        categoryLabel: 'INVERSION',
        authorName: 'JULIAN THORNE'
      }
    }

    if (blog.id === '3') {
      return {
        ...blog,
        categoryLabel: 'INTERIORISMO',
        authorName: 'ELENA ROSSI'
      }
    }

    if (blog.id === '4') {
      return {
        ...blog,
        categoryLabel: 'SUSTENTABILIDAD',
        authorName: 'MARCUS CHEN'
      }
    }

    if (blog.id === '5') {
      return {
        ...blog,
        categoryLabel: 'INVERSION',
        authorName: 'JULIAN THORNE'
      }
    }

    return blog
  })

/*
  Integracion futura con BD:
  Cuando backend exponga el modulo Blogs basado en las tablas `blog`,
  `categoria_blog` y `usuario`, reemplace el mock anterior por un fetch
  al endpoint publico correspondiente y mantenga este mapper.

  Ejemplo de contrato esperado:
  - blog.id
  - blog.titulo
  - blog.resumen o resumen derivado desde blog.contenido
  - blog.imagen
  - blog.estado
  - blog.eliminado
  - blog.fecha_publicacion
  - blog.categoria_id + categoria_blog.nombre
  - blog.usuario_id + usuario.nombre/apellido

  Solo deben mostrarse registros con:
  estado = "PUBLICADO" y eliminado = false
*/
