import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

// 📌 Obtener todas las zonas del usuario
export const getZonasUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zonas = await prisma.zona_usuario.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { creadoEn: 'desc' }
    })

    return res.json(zonas)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener zonas' })
  }
}

// 📌 Obtener una zona por ID
export const getZonaById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zona = await prisma.zona_usuario.findFirst({
      where: {
        id: Number(id),
        usuarioId: usuario.id
      }
    })

    if (!zona) {
      return res.status(404).json({ message: 'Zona no encontrada' })
    }

    return res.json(zona)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al obtener zona' })
  }
}

// 📌 Crear zona
export const createZona = async (req: Request, res: Response): Promise<Response> => {
  try {
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    const { nombre, descripcion, geometria, area } = req.body

    if (!nombre || !geometria) {
      return res.status(400).json({
        message: 'Nombre y geometría son obligatorios'
      })
    }

    // ✅ CORREGIDO: usar camelCase según Prisma
    const nuevaZona = await prisma.zona_usuario.create({
      data: {
        nombre,
        descripcion,
        geometria,
        area,
        usuarioId: usuario.id,
        actualizadoEn: new Date(),
        creadoEn: new Date()
      }
    })

    return res.status(201).json(nuevaZona)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al crear zona' })
  }
}

// 📌 Actualizar zona
export const updateZona = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    const { nombre, descripcion, geometria, area } = req.body;

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zona = await prisma.zona_usuario.findFirst({
      where: {
        id: Number(id),
        usuarioId: usuario.id
      }
    });

    if (!zona) {
      return res.status(404).json({ message: 'Zona no encontrada' });
    }

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zonaActualizada = await prisma.zona_usuario.update({
      where: { id: Number(id) },
      data: {
        nombre,
        descripcion,
        geometria,
        area,
        actualizadoEn: new Date()
      }
    });

    return res.json(zonaActualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar zona' });
  }
};

// 📌 Eliminar zona
export const deleteZona = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zona = await prisma.zona_usuario.findFirst({
      where: {
        id: Number(id),
        usuarioId: usuario.id
      }
    })

    if (!zona) {
      return res.status(404).json({ message: 'Zona no encontrada' })
    }

    await prisma.zona_usuario.delete({
      where: { id: Number(id) }
    })

    return res.json({ message: 'Zona eliminada correctamente' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error al eliminar zona' })
  }
}

// 📌 Obtener propiedades dentro de una zona (con PostGIS)
export const getPropiedadesEnZona = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const usuario = (req as any).usuario;
    if (!usuario) return res.status(401).json({ message: 'No autenticado' });

    const zonaId = Number(id)

    // ✅ CORREGIDO: usar camelCase según Prisma
    const zona = await prisma.zona_usuario.findFirst({
      where: {
        id: zonaId,
        usuarioId: usuario.id
      }
    })

    if (!zona) {
      return res.status(404).json({ message: 'Zona no encontrada o no te pertenece' })
    }

    const geoJsonText = JSON.stringify(zona.geometria)

    // SQL RAW: Aquí usamos snake_case porque hablamos con PostgreSQL directamente
    const inmueblesIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT DISTINCT i.id
      FROM "inmueble" i
      INNER JOIN "ubicacion_inmueble" ui ON i.id = ui."inmueble_id"
      WHERE 
        ui.latitud IS NOT NULL 
        AND ui.longitud IS NOT NULL
        AND ST_Within(
          ST_SetSRID(ST_MakePoint(ui.longitud::float, ui.latitud::float), 4326),
          ST_SetSRID(ST_GeomFromGeoJSON(${geoJsonText}), 4326)
        )
        AND i.estado = 'ACTIVO'
    `

    const ids = inmueblesIds.map(item => item.id)

    if (ids.length === 0) {
      return res.json({ success: true, data: [], total: 0 })
    }

    // ✅ CORREGIDO: usar camelCase según Prisma
    const propiedades = await prisma.inmueble.findMany({
      where: {
        id: { in: ids },
        estado: 'ACTIVO'
      },
      include: {
        ubicacion: true,              // ✅ relación correcta
        propietario: {                // ✅ relación correcta (no "usuario")
          select: {
            nombre: true,
            apellido: true,
            correo: true
          }
        },
        publicaciones: {              // ✅ relación correcta (plural)
          where: { estado: 'ACTIVA' },
          take: 1,
          include: {
            multimedia: {
              where: { tipo: 'IMAGEN' },
              take: 1,
              select: { url: true }
            }
          }
        }
      }
    })

    // ✅ CORREGIDO: mapeo correcto de campos
    const propiedadesFormateadas = propiedades.map(prop => ({
      id: prop.id,
      titulo: prop.titulo,
      tipo_accion: prop.tipoAccion,        // campo: tipoAccion
      precio: prop.precio,
      superficie_m2: prop.superficieM2,    // campo: superficieM2
      nro_cuartos: prop.nroCuartos,        // campo: nroCuartos
      nro_banos: prop.nroBanos,            // campo: nroBanos
      direccion: prop.ubicacion?.direccion,
      ciudad: prop.ubicacion?.ciudad,
      zona: prop.ubicacion?.zona,
      latitud: prop.ubicacion?.latitud ? Number(prop.ubicacion.latitud) : null,
      longitud: prop.ubicacion?.longitud ? Number(prop.ubicacion.longitud) : null,
      imagen: prop.publicaciones[0]?.multimedia[0]?.url || null,
      propietario: `${prop.propietario.nombre} ${prop.propietario.apellido}`,
      contacto: prop.propietario.correo
    }))

    return res.json({
      success: true,
      data: propiedadesFormateadas,
      total: propiedadesFormateadas.length
    })
  } catch (error) {
    console.error('Error en getPropiedadesEnZona:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al obtener propiedades en la zona',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
}