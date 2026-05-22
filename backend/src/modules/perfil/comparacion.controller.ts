import { Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import type { AuthRequest } from '../../middleware/validarJWT.js'

export const comparacionController = {
  // Obtener todas las comparaciones del usuario autenticado
  async getComparaciones(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      const comparaciones = await prisma.comparacion.findMany({
        where: { usuarioId },
        include: {
          detalle_comparacion: {
            include: {
              inmueble: {
                include: {
                  ubicacion: true
                }
              }
            },
            orderBy: {
              orden: 'asc'
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      })

      // Transformar los datos para el formato del mockup
      const historialFormateado = comparaciones.map((comp) => ({
        id: comp.id,
        nombre: comp.nombre,
        fecha: comp.creadoEn,
        propiedades: comp.detalle_comparacion.map((detalle) => ({
          id: detalle.inmueble.id,
          titulo: detalle.inmueble.titulo,
          ubicacion:
            detalle.inmueble.ubicacion?.zona ||
            detalle.inmueble.ubicacion?.ciudad ||
            'Ubicación no disponible',
          precio: detalle.inmueble.precio,
          superficie: detalle.inmueble.superficieM2,
          categoria: detalle.inmueble.categoria,
          tipoAccion: detalle.inmueble.tipoAccion
        }))
      }))

      res.json(historialFormateado)
    } catch (error) {
      console.error('Error al obtener comparaciones:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Obtener comparación por ID
  async getComparacionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      // ✅ Asegurar que id es string
      const comparacionId = Array.isArray(id) ? id[0] : id

      if (!comparacionId) {
        return res.status(400).json({ error: 'ID no válido' })
      }

      const comparacion = await prisma.comparacion.findFirst({
        where: {
          id: parseInt(comparacionId),
          usuarioId
        },
        include: {
          detalle_comparacion: {
            include: {
              inmueble: {
                include: {
                  ubicacion: true
                }
              }
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      })

      if (!comparacion) {
        return res.status(404).json({ error: 'Comparación no encontrada' })
      }

      res.json(comparacion)
    } catch (error) {
      console.error('Error al obtener comparación:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Crear nueva comparación
  async crearComparacion(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.usuario?.id
      const { nombre, inmueblesIds } = req.body

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      if (!inmueblesIds || inmueblesIds.length < 2) {
        return res.status(400).json({
          error: 'Se necesitan al menos 2 propiedades para comparar'
        })
      }

      // Verificar que los inmuebles existen
      const inmuebles = await prisma.inmueble.findMany({
        where: {
          id: { in: inmueblesIds }
        }
      })

      if (inmuebles.length !== inmueblesIds.length) {
        return res.status(404).json({
          error: 'Una o más propiedades no existen'
        })
      }

      // Crear la comparación
      const comparacion = await prisma.comparacion.create({
        data: {
          nombre: nombre || `Comparación ${new Date().toLocaleDateString('es-ES')}`,
          usuarioId,
          detalle_comparacion: {
            create: inmueblesIds.map((inmuebleId: number, index: number) => ({
              inmuebleId,
              orden: index
            }))
          }
        },
        include: {
          detalle_comparacion: {
            include: {
              inmueble: true
            }
          }
        }
      })

      res.status(201).json(comparacion)
    } catch (error) {
      console.error('Error al crear comparación:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Eliminar comparación
  async eliminarComparacion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      // ✅ Asegurar que id es string
      const comparacionId = Array.isArray(id) ? id[0] : id

      if (!comparacionId) {
        return res.status(400).json({ error: 'ID no válido' })
      }

      const comparacion = await prisma.comparacion.findFirst({
        where: {
          id: parseInt(comparacionId),
          usuarioId
        }
      })

      if (!comparacion) {
        return res.status(404).json({ error: 'Comparación no encontrada' })
      }

      await prisma.comparacion.delete({
        where: { id: parseInt(comparacionId) }
      })

      res.status(200).json({ message: 'Comparación eliminada exitosamente' })
    } catch (error) {
      console.error('Error al eliminar comparación:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Agregar propiedad a comparación existente
  async agregarPropiedad(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { inmuebleId } = req.body
      const usuarioId = req.usuario?.id

      // ✅ Asegurar que id es string
      const comparacionId = Array.isArray(id) ? id[0] : id

      if (!comparacionId) {
        return res.status(400).json({ error: 'ID no válido' })
      }

      const comparacion = await prisma.comparacion.findFirst({
        where: {
          id: parseInt(comparacionId),
          usuarioId
        },
        include: {
          detalle_comparacion: true
        }
      })

      if (!comparacion) {
        return res.status(404).json({ error: 'Comparación no encontrada' })
      }

      // Verificar si la propiedad ya está en la comparación
      const yaExiste = comparacion.detalle_comparacion.some(
        (d) => d.inmuebleId === parseInt(inmuebleId)
      )

      if (yaExiste) {
        return res.status(400).json({ error: 'La propiedad ya está en esta comparación' })
      }

      const nuevoOrden = comparacion.detalle_comparacion.length

      const detalleActualizado = await prisma.detalle_comparacion.create({
        data: {
          comparacionId: parseInt(comparacionId),
          inmuebleId: parseInt(inmuebleId),
          orden: nuevoOrden
        },
        include: {
          inmueble: true
        }
      })

      res.status(200).json(detalleActualizado)
    } catch (error) {
      console.error('Error al agregar propiedad:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Eliminar propiedad de comparación
  async eliminarPropiedad(req: AuthRequest, res: Response) {
    try {
      const { id, propiedadId } = req.params
      const usuarioId = req.usuario?.id

      // ✅ Asegurar que los IDs son strings
      const comparacionId = Array.isArray(id) ? id[0] : id
      const propiedadIdValue = Array.isArray(propiedadId) ? propiedadId[0] : propiedadId

      if (!comparacionId || !propiedadIdValue) {
        return res.status(400).json({ error: 'IDs no válidos' })
      }

      const comparacion = await prisma.comparacion.findFirst({
        where: {
          id: parseInt(comparacionId),
          usuarioId
        }
      })

      if (!comparacion) {
        return res.status(404).json({ error: 'Comparación no encontrada' })
      }

      await prisma.detalle_comparacion.deleteMany({
        where: {
          comparacionId: parseInt(comparacionId),
          inmuebleId: parseInt(propiedadIdValue)
        }
      })

      res.status(200).json({
        message: 'Propiedad eliminada de la comparación'
      })
    } catch (error) {
      console.error('Error al eliminar propiedad:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Obtener comparaciones filtradas por categoría
  async getComparacionesPorCategoria(req: AuthRequest, res: Response) {
    try {
      const { categoria } = req.params
      const usuarioId = req.usuario?.id

      // ✅ Asegurar que categoria es string
      const categoriaValue = Array.isArray(categoria) ? categoria[0] : categoria

      if (!categoriaValue) {
        return res.status(400).json({ error: 'Categoría no válida' })
      }

      const comparaciones = await prisma.comparacion.findMany({
        where: {
          usuarioId,
          detalle_comparacion: {
            some: {
              inmueble: {
                categoria: categoriaValue.toUpperCase() as any
              }
            }
          }
        },
        include: {
          detalle_comparacion: {
            include: {
              inmueble: {
                include: {
                  ubicacion: true
                }
              }
            },
            orderBy: {
              orden: 'asc'
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      })

      res.json(comparaciones)
    } catch (error) {
      console.error('Error al obtener comparaciones por categoría:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Obtener resumen para el mockup (con datos agrupados por categoría)
  async getResumenComparaciones(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      const comparaciones = await prisma.comparacion.findMany({
        where: { usuarioId },
        include: {
          detalle_comparacion: {
            include: {
              inmueble: {
                include: {
                  ubicacion: true
                }
              }
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      })

      // Agrupar por categoría para el mockup
      const groupedByCategoria = comparaciones.reduce(
        (acc, comp) => {
          // Obtener la categoría de la primera propiedad o usar "OTROS"
          const categoria = comp.detalle_comparacion[0]?.inmueble.categoria || 'OTROS'

          // Usar categoria como string para el índice
          const categoriaKey = String(categoria)

          if (!acc[categoriaKey]) {
            acc[categoriaKey] = []
          }

          acc[categoriaKey].push({
            id: comp.id,
            nombre: comp.nombre,
            fecha: comp.creadoEn,
            propiedades: comp.detalle_comparacion.map((detalle) => ({
              id: detalle.inmueble.id,
              ubicacion:
                detalle.inmueble.ubicacion?.zona ||
                detalle.inmueble.ubicacion?.ciudad ||
                'Ubicación no disponible',
              precio: detalle.inmueble.precio,
              superficie: detalle.inmueble.superficieM2,
              rangoPrecio: `$${detalle.inmueble.precio}`,
              rangoSuperficie: detalle.inmueble.superficieM2
                ? `${detalle.inmueble.superficieM2}m²`
                : 'Superficie no especificada',
              tipoAccion: detalle.inmueble.tipoAccion
            }))
          })
          return acc
        },
        {} as Record<string, any>
      )

      res.json({
        historial: groupedByCategoria,
        ultimaActualizacion: new Date(),
        totalComparaciones: comparaciones.length
      })
    } catch (error) {
      console.error('Error al obtener resumen:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
