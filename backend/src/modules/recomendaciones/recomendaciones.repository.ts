import { prisma } from '../../lib/prisma.client.js'

export class RecomendacionesRepository {
  async getHistorialVistas(usuarioId: number, diasLimite: number = 90) {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - diasLimite)

    const vistas = await prisma.propiedad_vista.findMany({
      where: {
        usuarioId,
        vistaEn: { gte: fechaLimite }
      },
      select: {
        inmuebleId: true,
        vistaEn: true,
        inmueble: {
          select: {
            id: true,
            categoria: true,
            precio: true,
            superficieM2: true,
            ubicacion: {
              select: { zona: true, ciudad: true }
            }
          }
        }
      },
      orderBy: { vistaEn: 'desc' }
    })

    const hoy = new Date()
    return vistas.map((vista) => {
      const diasDiferencia = Math.floor(
        (hoy.getTime() - new Date(vista.vistaEn).getTime()) / (1000 * 3600 * 24)
      )
      let peso = 0.3
      if (diasDiferencia <= 7) peso = 1.0
      else if (diasDiferencia <= 14) peso = 0.7

      return {
        inmuebleId: vista.inmuebleId,
        vistaEn: vista.vistaEn,
        peso,
        inmueble: vista.inmueble
      }
    })
  }

  async getUltimasBusquedas(usuarioId: number, limite: number = 10) {
    const visitor = await prisma.visitor.findFirst({
      where: { usuario_id: usuarioId },
      orderBy: { fecha_visita: 'desc' }
    })

    if (!visitor?.meta_data) return []

    const metaData = visitor.meta_data as any
    const busquedas = metaData.busquedas || []

    return busquedas.slice(-limite).reverse()
  }

  async getFavoritos(usuarioId: number) {
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      include: {
        inmueble: {
          include: {
            ubicacion: true
          }
        }
      },
      orderBy: { agregadoEn: 'desc' }
    })

    return favoritos.map((f) => f.inmueble)
  }

  async getInmueblesCandidatos(usuarioId: number, limit: number = 100) {
    return await prisma.inmueble.findMany({
      where: {
        estado: 'ACTIVO'
      },
      include: {
        ubicacion: true
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
      include: {
        ubicacion: true
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
      by: ['inmuebleId'],
      _count: { inmuebleId: true },
      orderBy: { _count: { inmuebleId: 'desc' } },
      take: limit
    })

    const ids = inmueblesConVisitas.map((v) => v.inmuebleId)

    return await prisma.inmueble.findMany({
      where: { id: { in: ids } },
      include: { ubicacion: true }
    })
  }
  async getInmueblesPopularesPorZona(zona: string, limit: number = 50, usuarioId?: number) {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 7)

    let idsExcluir: number[] = []
    if (usuarioId) {
      const vistasPrevias = await prisma.propiedad_vista.findMany({
        where: { usuarioId },
        select: { inmuebleId: true }
      })
      idsExcluir = vistasPrevias.map((v) => v.inmuebleId)
    }

    const popularesPorZona = await prisma.propiedad_vista.groupBy({
      by: ['inmuebleId'],
      where: {
        vistaEn: { gte: fechaLimite }
      },
      _count: { inmuebleId: true },
      orderBy: { _count: { inmuebleId: 'desc' } },
      take: limit * 2
    })

    const ids = popularesPorZona.map((v) => v.inmuebleId)
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
      include: { ubicacion: true },
      take: limit
    })
  }

  async getZonaConexionUsuario(usuarioId: number): Promise<string | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
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
      include: {
        ubicacion: true
      }
    })
  }
}
