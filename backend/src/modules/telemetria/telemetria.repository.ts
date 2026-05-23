import { prisma } from '../../lib/prisma.client.js'

export class TelemetriaRepository {
  async guardarBusqueda(usuario_id: number | null, ip: string, metaData: any) {
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
          usuario_id: usuario_id,
          meta_data: {
            busquedas: [metaData],
            primeraVisita: new Date().toISOString()
          }
        }
      })
    }
  }

  async registrarClickInmueble(usuario_id: number, inmueble_id: number) {
  // 1. Registrar la vista como antes
  const vista = await prisma.propiedad_vista.upsert({
    where: {
      usuario_id_inmueble_id: { usuario_id, inmueble_id }
    },
    update: { vista_en: new Date() },
    create: { usuario_id, inmueble_id, vista_en: new Date() }
  })

  // 2. Obtener features del inmueble para guardar en entrenamiento_ml
  const inmueble = await prisma.inmueble.findUnique({
    where: { id: inmueble_id },
    include: { ubicacion: true, inmueble_amenidad: true }
  })

  if (inmueble) {
    // Calcular score_real basado en interacciones previas del usuario
    const vistasAnteriores = await prisma.propiedad_vista.count({
      where: { usuario_id }
    })
    const favoritosCount = await prisma.favorito.count({
      where: { usuario_id, inmueble_id }
    })
    const esFavorito = favoritosCount > 0
    const score_real = esFavorito ? 1.0 : Math.min(vistasAnteriores / 10, 0.8)

    // Guardar en entrenamiento_ml de forma asíncrona (no bloquea la respuesta)
    prisma.entrenamiento_ml.create({
      data: {
        usuario_id: usuario_id,
        inmueble_id: inmueble_id,
        tipo_evento: 'CLICK',
        score_real,
        features: {
          categoria: inmueble.categoria,
          tipo_accion: inmueble.tipo_accion,
          precio: Number(inmueble.precio),
          superficie_m2: Number(inmueble.superficie_m2 || 0),
          nro_cuartos: inmueble.nro_cuartos || 0,
          nro_banos: inmueble.nro_banos || 0,
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

  async obtenerInmueblesRecomendados(usuario_id?: number): Promise<number[]> {
    if (!usuario_id) {
      // CA 1: Si no está registrado, devolver populares generales
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmueble_id'],
        _count: {
          inmueble_id: true,
        },
        orderBy: {
          _count: {
            inmueble_id: 'desc',
          },
        },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmueble_id);
    }

    // CA 5, CA 6, CA 7, CA 10: Si está registrado, buscar por su historial
    const vistas = await prisma.propiedad_vista.findMany({
      where: { usuario_id: usuario_id },
      orderBy: { vista_en: 'desc' },
      take: 20,
      select: { inmueble_id: true }
    })

    const favoritos = await prisma.favorito.findMany({
      where: { usuario_id: usuario_id },
      select: { inmueble_id: true }
    })

    const idsFavoritos = favoritos.map((f) => f.inmueble_id)
    const idsVistos = vistas.map((v) => v.inmueble_id)

    const resultados = [...new Set([...idsFavoritos, ...idsVistos])];

    // Fallback: Si el usuario está registrado pero su historial está vacío (ej. cuenta recién creada)
    if (resultados.length === 0) {
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmueble_id'],
        _count: { inmueble_id: true },
        orderBy: { _count: { inmueble_id: 'desc' } },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmueble_id);
    }

    return resultados;
  }
}

