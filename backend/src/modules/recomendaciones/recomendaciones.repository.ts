import { prisma } from '../../lib/prisma.client.js'

export class RecomendacionesRepository {
  async getHistorialVistas(usuario_id: number, diasLimite: number = 90) {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - diasLimite)

    const vistas = await prisma.propiedad_vista.findMany({
      where: {
        usuario_id,
        vista_en: { gte: fechaLimite }
      },
      select: {
        inmueble_id: true,
        vista_en: true,
        inmueble: {
          select: {
            id: true,
            categoria: true,
            precio: true,
            superficie_m2: true,
            ubicacion: {
              select: { zona: true, ciudad: true }
            }
          }
        }
      },
      orderBy: { vista_en: 'desc' }
    })

    const hoy = new Date()
    return vistas.map((vista) => {
      const diasDiferencia = Math.floor(
        (hoy.getTime() - new Date(vista.vista_en).getTime()) / (1000 * 3600 * 24)
      )
      let peso = 0.3
      if (diasDiferencia <= 7) peso = 1.0
      else if (diasDiferencia <= 14) peso = 0.7

      return {
        inmueble_id: vista.inmueble_id,
        vista_en: vista.vista_en,
        peso,
        inmueble: vista.inmueble
      }
    })
  }

  async getUltimasBusquedas(usuario_id: number, limite: number = 10) {
    const visitor = await prisma.visitor.findFirst({
      where: { usuario_id: usuario_id },
      orderBy: { fecha_visita: 'desc' }
    })

    if (!visitor?.meta_data) return []

    const metaData = visitor.meta_data as any
    const busquedas = metaData.busquedas || []

    return busquedas.slice(-limite).reverse()
  }

  async getFavoritos(usuario_id: number) {
    const favoritos = await prisma.favorito.findMany({
      where: { usuario_id },
      include: {
        inmueble: {
          include: { publicaciones: true
          }
        }
      },
      orderBy: { agregado_en: 'desc' }
    })

    return favoritos.map((f) => f.inmueble)
  }

  async getInmueblesCandidatos(usuario_id: number, limit: number = 100) {
    return await prisma.inmueble.findMany({
      where: {
        estado: 'ACTIVO'
      },
      include: { publicaciones: true,
        ubicacion: {
          select: { zona: true, ciudad: true }
        }
      },
      take: limit
    })
    console.log('DATABASE_URL actual:', process.env.DATABASE_URL)
  }

  async getInmueblesPorZona(zona: string, limit: number = 50) {
    return await prisma.inmueble.findMany({
      where: {
        estado: 'ACTIVO',
        ubicacion: {
          zona: { contains: zona, mode: 'insensitive' }
        }
      },
      include: { publicaciones: true,
        ubicacion: {
          select: { zona: true, ciudad: true }
        }
      },
      take: limit
    })
  }

  async getInmueblesPopulares(limit: number = 50, zona?: string) {
    const whereClause: any = { estado: 'ACTIVO' }
    if (zona) {
      whereClause.ubicacion = { zona: { contains: zona, mode: 'insensitive' } }
    }

    const inmueblesConVisitas = await prisma.propiedad_vista.groupBy({
      by: ['inmueble_id'],
      _count: { inmueble_id: true },
      orderBy: { _count: { inmueble_id: 'desc' } },
      take: limit
    })

    const ids = inmueblesConVisitas.map((v) => v.inmueble_id)

    return await prisma.inmueble.findMany({
      where: { id: { in: ids } },
      include: { publicaciones: true,
        ubicacion: {
          select: { zona: true, ciudad: true }
        }
      }
    })
  }
  async getInmueblesPopularesPorZona(zona: string, limit: number = 50, usuario_id?: number) {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 7)

    let idsExcluir: number[] = []
    if (usuario_id) {
      const vistasPrevias = await prisma.propiedad_vista.findMany({
        where: { usuario_id },
        select: { inmueble_id: true }
      })
      idsExcluir = vistasPrevias.map((v) => v.inmueble_id)
    }

    const popularesPorZona = await prisma.propiedad_vista.groupBy({
      by: ['inmueble_id'],
      where: {
        vista_en: { gte: fechaLimite }
      },
      _count: { inmueble_id: true },
      orderBy: { _count: { inmueble_id: 'desc' } },
      take: limit * 2
    })

    const ids = popularesPorZona.map((v) => v.inmueble_id)
    if (ids.length === 0) return []

    const idsFinales = ids.filter((id) => !idsExcluir.includes(id))
    if (idsFinales.length === 0) return []

    return await prisma.inmueble.findMany({
      where: {
        id: { in: idsFinales },
        estado: 'ACTIVO',
        ubicacion: {
          zona: { contains: zona, mode: 'insensitive' }
        }
      },
      include: { publicaciones: true,
        ubicacion: {
          select: { zona: true, ciudad: true }
        }
      },
      take: limit
    })
  }

  async getZonaConexionUsuario(usuario_id: number): Promise<string | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
      select: { zona_conexion: true }
    })

    return usuario?.zona_conexion || null
  }

  async getInmueblesPorIds(ids: number[]) {
    return await prisma.inmueble.findMany({
      where: {
        id: { in: ids },
        estado: 'ACTIVO'
      },
      include: { publicaciones: true,
        ubicacion: {
          select: { zona: true, ciudad: true }
        }
      }
    })
  }
}

