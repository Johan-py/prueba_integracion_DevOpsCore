import { prisma } from '../../lib/prisma.client.js'

export class TelemetriaRepository {
  async guardarBusqueda(usuarioId: number | null, ip: string, metaData: any) {
    const treintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000)

    const visitorExistente = await prisma.visitor.findFirst({
      where: {
        ip: ip,
        fecha_visita: { gte: treintaMinutosAtras }
      }
    })

    if (visitorExistente) {
      const metaDataExistente = (visitorExistente.meta_data as any) || {}
      const busquedasAnteriores = metaDataExistente.busquedas || []

      return await prisma.visitor.update({
        where: { id: visitorExistente.id },
        data: {
          meta_data: {
            ...metaDataExistente,
            busquedas: [...busquedasAnteriores, metaData],
            ultimaBusqueda: new Date().toISOString()
          }
        }
      })
    } else {
      return await prisma.visitor.create({
        data: {
          ip: ip,
          usuario_id: usuarioId,
          meta_data: {
            busquedas: [metaData],
            primeraVisita: new Date().toISOString()
          }
        }
      })
    }
  }

  async registrarClickInmueble(usuarioId: number, inmuebleId: number) {
  // 1. Registrar la vista como antes
  const vista = await prisma.propiedad_vista.upsert({
    where: {
      usuarioId_inmuebleId: { usuarioId, inmuebleId }
    },
    update: { vistaEn: new Date() },
    create: { usuarioId, inmuebleId, vistaEn: new Date() }
  })

  // 2. Obtener features del inmueble para guardar en entrenamiento_ml
  const inmueble = await prisma.inmueble.findUnique({
    where: { id: inmuebleId },
    include: { ubicacion: true, inmueble_amenidad: true }
  })

  if (inmueble) {
    // Calcular score_real basado en interacciones previas del usuario
    const vistasAnteriores = await prisma.propiedad_vista.count({
      where: { usuarioId }
    })
    const favoritosCount = await prisma.favorito.count({
      where: { usuarioId, inmuebleId }
    })
    const esFavorito = favoritosCount > 0
    const score_real = esFavorito ? 1.0 : Math.min(vistasAnteriores / 10, 0.8)

    // Guardar en entrenamiento_ml de forma asíncrona (no bloquea la respuesta)
    prisma.entrenamiento_ml.create({
      data: {
        usuario_id: usuarioId,
        inmueble_id: inmuebleId,
        tipo_evento: 'CLICK',
        score_real,
        features: {
          categoria: inmueble.categoria,
          tipoAccion: inmueble.tipoAccion,
          precio: Number(inmueble.precio),
          superficieM2: Number(inmueble.superficieM2 || 0),
          nroCuartos: inmueble.nroCuartos || 0,
          nroBanos: inmueble.nroBanos || 0,
          zona: inmueble.ubicacion?.zona || null,
          ciudad: inmueble.ubicacion?.ciudad || null,
          amenidades: inmueble.inmueble_amenidad.map(a => a.amenidad_id),
          precioReducido: inmueble.precio_anterior !== null &&
            Number(inmueble.precio_anterior) > Number(inmueble.precio)
        },
        usado_en_modelo: false
      }
    }).catch(err => console.error('[ML] Error guardando entrenamiento_ml:', err))
  }

  return vista
}

  async obtenerInmueblesRecomendados(usuarioId?: number): Promise<number[]> {
    if (!usuarioId) {
      // CA 1: Si no está registrado, devolver populares generales
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmuebleId'],
        _count: {
          inmuebleId: true,
        },
        orderBy: {
          _count: {
            inmuebleId: 'desc',
          },
        },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmuebleId);
    }

    // CA 5, CA 6, CA 7, CA 10: Si está registrado, buscar por su historial
    const vistas = await prisma.propiedad_vista.findMany({
      where: { usuarioId: usuarioId },
      orderBy: { vistaEn: 'desc' },
      take: 20,
      select: { inmuebleId: true }
    })

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId: usuarioId },
      select: { inmuebleId: true }
    })

    const idsFavoritos = favoritos.map((f) => f.inmuebleId)
    const idsVistos = vistas.map((v) => v.inmuebleId)

    const resultados = [...new Set([...idsFavoritos, ...idsVistos])];

    // Fallback: Si el usuario está registrado pero su historial está vacío (ej. cuenta recién creada)
    if (resultados.length === 0) {
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmuebleId'],
        _count: { inmuebleId: true },
        orderBy: { _count: { inmuebleId: 'desc' } },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmuebleId);
    }

    return resultados;
  }
}
