import { BlogComment } from '@/types/blogComment'

const now = Date.now()

const isoFromNow = (minutesAgo: number) => new Date(now - minutesAgo * 60 * 1000).toISOString()

export const MOCK_BLOG_COMMENTS_BY_BLOG_ID: Record<string, BlogComment[]> = {
  '1': [
    {
      id: 'comment-1',
      blogId: '1',
      parentId: null,
      author: {
        id: 'user-elena',
        name: 'Elena Rossi',
        avatar: 'https://i.pravatar.cc/120?img=32'
      },
      content:
        'Absolutamente fascinante. En PropBol hemos estado siguiendo estas tendencias muy de cerca. Hay algun proyecto especifico en Madrid que ya este implementando esta tecnologia de captura de carbono?',
      createdAt: isoFromNow(130),
      updatedAt: null,
      likes: 12,
      likedByCurrentUser: false
    },
    {
      id: 'comment-2',
      blogId: '1',
      parentId: 'comment-1',
      author: {
        id: 'user-marco',
        name: 'Marco V.',
        avatar: 'https://i.pravatar.cc/120?img=14'
      },
      content:
        'El nuevo complejo Reserva del Prado esta usando una variante similar para su fachada estructural. Vale mucho la pena seguirlo de cerca.',
      createdAt: isoFromNow(75),
      updatedAt: null,
      likes: 4,
      likedByCurrentUser: false
    },
    {
      id: 'comment-3',
      blogId: '1',
      parentId: null,
      author: {
        id: 'user-roberto',
        name: 'Roberto S.',
        avatar: 'https://i.pravatar.cc/120?img=12'
      },
      content:
        'Excelente articulo. Como inversionista, me interesa saber como afecta esto a los tiempos de fraguado y construccion. Es comparable al concreto tradicional?',
      createdAt: isoFromNow(45),
      updatedAt: null,
      likes: 2,
      likedByCurrentUser: false
    },
    {
      id: 'comment-4',
      blogId: '1',
      parentId: null,
      author: {
        id: 'user-valeria',
        name: 'Valeria M.',
        avatar: 'https://i.pravatar.cc/120?img=47'
      },
      content:
        'Gracias por compartir un angulo tan claro. Me gusto mucho la comparacion entre lujo, eficiencia y sostenibilidad.',
      createdAt: isoFromNow(28),
      updatedAt: null,
      likes: 6,
      likedByCurrentUser: false
    },
    {
      id: 'comment-5',
      blogId: '1',
      parentId: 'comment-4',
      author: {
        id: 'user-andres',
        name: 'Andres P.',
        avatar: 'https://i.pravatar.cc/120?img=19'
      },
      content:
        'Coincido. La parte de eficiencia operativa fue la que mas me sorprendio.',
      createdAt: isoFromNow(21),
      updatedAt: null,
      likes: 1,
      likedByCurrentUser: false
    },
    {
      id: 'comment-6',
      blogId: '1',
      parentId: null,
      author: {
        id: 'user-camila',
        name: 'Camila R.',
        avatar: 'https://i.pravatar.cc/120?img=25'
      },
      content:
        'Seria genial ver una segunda parte con ejemplos en Latinoamerica. Creo que ahi esta una conversacion muy interesante.',
      createdAt: isoFromNow(18),
      updatedAt: null,
      likes: 3,
      likedByCurrentUser: false
    },
    {
      id: 'comment-7',
      blogId: '1',
      parentId: null,
      author: {
        id: 'user-paula',
        name: 'Paula N.',
        avatar: 'https://i.pravatar.cc/120?img=41'
      },
      content:
        'Me gusto mucho el articulo, sobre todo porque aterriza conceptos complejos en decisiones reales para quienes compran o desarrollan propiedades.',
      createdAt: isoFromNow(12),
      updatedAt: null,
      likes: 8,
      likedByCurrentUser: false
    },
    {
      id: 'comment-8',
      blogId: '1',
      parentId: 'comment-7',
      author: {
        id: 'user-nicolas',
        name: 'Nicolas T.',
        avatar: 'https://i.pravatar.cc/120?img=9'
      },
      content:
        'Totalmente. Ademas deja claro que sostenibilidad no esta peleada con aspiracionalidad.',
      createdAt: isoFromNow(10),
      updatedAt: null,
      likes: 2,
      likedByCurrentUser: false
    }
  ],
  '2': [
    {
      id: 'comment-9',
      blogId: '2',
      parentId: null,
      author: {
        id: 'user-lucia',
        name: 'Lucia G.',
        avatar: 'https://i.pravatar.cc/120?img=5'
      },
      content:
        'Muy buena lectura. El enfoque en ciudades secundarias me parece especialmente acertado para este momento del mercado.',
      createdAt: isoFromNow(180),
      updatedAt: null,
      likes: 5,
      likedByCurrentUser: false
    }
  ],
  '3': [
    {
      id: 'comment-10',
      blogId: '3',
      parentId: null,
      author: {
        id: 'user-sofia',
        name: 'Sofia C.',
        avatar: 'https://i.pravatar.cc/120?img=45'
      },
      content:
        'El tema del bienestar y la distribucion del espacio me parecio muy bien explicado. Gracias por compartirlo.',
      createdAt: isoFromNow(95),
      updatedAt: null,
      likes: 7,
      likedByCurrentUser: false
    }
  ]
}
