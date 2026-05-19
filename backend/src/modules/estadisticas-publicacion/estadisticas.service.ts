import { EstadoPublicacion } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.client.js";

type RegistrarVistaParams = {
  publicacionId: number;
  usuarioId?: number;
  visitorToken?: string;
  ip: string;
  userAgent?: string;
};

type RegistrarVistaPorInmuebleParams = {
  inmuebleId: number;
  usuarioId?: number;
  visitorToken?: string;
  ip: string;
  userAgent?: string;
};

type RegistrarCompartidoParams = {
  publicacionId: number;
  usuarioId: number;
  medio?: string;
};

type RegistrarCompartidoPorInmuebleParams = {
  inmuebleId: number;
  usuarioId: number;
  medio?: string;
};

type ObtenerEstadisticasParams = {
  publicacionId: number;
  usuarioId: number;
};

export class EstadisticasPublicacionService {
  private static async obtenerOCrearVisitor({
    token,
    ip,
    userAgent,
    usuarioId,
  }: {
    token?: string;
    ip: string;
    userAgent?: string;
    usuarioId?: number;
  }) {
    if (token) {
      const visitorExistente = await prisma.visitor.findUnique({
        where: {
          token,
        },
      });

      if (visitorExistente) {
        return visitorExistente;
      }
    }

    const nuevoToken = token || crypto.randomUUID();

    return prisma.visitor.create({
      data: {
        token: nuevoToken,
        ip,
        usuario_id: usuarioId || null,
        meta_data: {
          userAgent: userAgent || null,
          tipo: usuarioId ? "USUARIO_REGISTRADO" : "VISITANTE",
        },
      },
    });
  }

  static async registrarVista({
    publicacionId,
    usuarioId,
    visitorToken,
    ip,
    userAgent,
  }: RegistrarVistaParams) {
    const publicacion = await prisma.publicacion.findUnique({
      where: {
        id: publicacionId,
      },
      select: {
        id: true,
        estado: true,
        inmuebleId: true,
      },
    });

    if (!publicacion) {
      throw new Error("PUBLICACION_NO_EXISTE");
    }

    if (publicacion.estado !== EstadoPublicacion.ACTIVA) {
      return {
        registrada: false,
        mensaje:
          "La publicación no está activa. No se registró la visualización.",
      };
    }

    const visitor = await this.obtenerOCrearVisitor({
      token: visitorToken,
      ip,
      userAgent,
      usuarioId,
    });

    await prisma.$transaction(async (tx) => {
      await tx.publicacion_vista.create({
        data: {
          publicacion_id: publicacionId,
          usuario_id: usuarioId || null,
          visitor_id: visitor.id,
          ip,
          user_agent: userAgent || null,
        },
      });

      await tx.publicacion_estadistica.upsert({
        where: {
          publicacion_id: publicacionId,
        },
        update: {
          total_visualizaciones: {
            increment: 1,
          },
          actualizado_en: new Date(),
        },
        create: {
          publicacion_id: publicacionId,
          total_visualizaciones: 1,
          total_compartidos: 0,
        },
      });

      /*
        Esto actualiza la sección "Mis propiedades vistas".
        Solo se guarda cuando el usuario está logueado.
      */
      if (usuarioId) {
        await tx.propiedad_vista.upsert({
          where: {
            usuarioId_inmuebleId: {
              usuarioId,
              inmuebleId: publicacion.inmuebleId,
            },
          },
          update: {
            veces_visto: {
              increment: 1,
            },
            vistaEn: new Date(),
            activo: true,
          },
          create: {
            usuarioId,
            inmuebleId: publicacion.inmuebleId,
            veces_visto: 1,
            activo: true,
          },
        });
      }
    });

    return {
      registrada: true,
      visitorToken: visitor.token,
      mensaje: "Visualización registrada correctamente.",
    };
  }

  static async registrarVistaPorInmueble({
    inmuebleId,
    usuarioId,
    visitorToken,
    ip,
    userAgent,
  }: RegistrarVistaPorInmuebleParams) {
    const publicacion = await prisma.publicacion.findFirst({
      where: {
        inmuebleId,
        estado: EstadoPublicacion.ACTIVA,
      },
      select: {
        id: true,
      },
    });

    if (!publicacion) {
      throw new Error("PUBLICACION_NO_EXISTE");
    }

    return this.registrarVista({
      publicacionId: publicacion.id,
      usuarioId,
      visitorToken,
      ip,
      userAgent,
    });
  }

  static async registrarCompartido({
    publicacionId,
    usuarioId,
    medio,
  }: RegistrarCompartidoParams) {
    const publicacion = await prisma.publicacion.findUnique({
      where: {
        id: publicacionId,
      },
      select: {
        id: true,
        estado: true,
      },
    });

    if (!publicacion) {
      throw new Error("PUBLICACION_NO_EXISTE");
    }

    if (publicacion.estado !== EstadoPublicacion.ACTIVA) {
      return {
        registrado: false,
        mensaje: "La publicación no está activa. No se registró el compartido.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.publicacion_compartido.create({
        data: {
          publicacion_id: publicacionId,
          usuario_id: usuarioId,
          medio: medio || "GENERAL",
        },
      });

      await tx.publicacion_estadistica.upsert({
        where: {
          publicacion_id: publicacionId,
        },
        update: {
          total_compartidos: {
            increment: 1,
          },
          actualizado_en: new Date(),
        },
        create: {
          publicacion_id: publicacionId,
          total_visualizaciones: 0,
          total_compartidos: 1,
        },
      });
    });

    return {
      registrado: true,
      mensaje: "Compartido registrado correctamente.",
    };
  }

  static async registrarCompartidoPorInmueble({
    inmuebleId,
    usuarioId,
    medio,
  }: RegistrarCompartidoPorInmuebleParams) {
    const publicacion = await prisma.publicacion.findFirst({
      where: {
        inmuebleId,
        estado: EstadoPublicacion.ACTIVA,
      },
      select: {
        id: true,
      },
    });

    if (!publicacion) {
      throw new Error("PUBLICACION_NO_EXISTE");
    }

    return this.registrarCompartido({
      publicacionId: publicacion.id,
      usuarioId,
      medio,
    });
  }

  static async obtenerEstadisticas({
    publicacionId,
    usuarioId,
  }: ObtenerEstadisticasParams) {
    const publicacion = await prisma.publicacion.findUnique({
      where: {
        id: publicacionId,
      },
      select: {
        id: true,
        titulo: true,
        estado: true,
        usuarioId: true,
      },
    });

    if (!publicacion) {
      throw new Error("PUBLICACION_NO_EXISTE");
    }

    if (publicacion.usuarioId !== usuarioId) {
      throw new Error("NO_ES_PROPIETARIO");
    }

    const estadistica = await prisma.publicacion_estadistica.findUnique({
      where: {
        publicacion_id: publicacionId,
      },
      select: {
        total_visualizaciones: true,
        total_compartidos: true,
      },
    });

    return {
      publicacionId: publicacion.id,
      titulo: publicacion.titulo,
      estado: publicacion.estado,
      totalVisualizaciones: estadistica?.total_visualizaciones ?? 0,
      totalCompartidos: estadistica?.total_compartidos ?? 0,
    };
  }

  static async obtenerMisPropiedadesVistas(usuarioId: number) {
    const vistas = await prisma.propiedad_vista.findMany({
      where: {
        usuarioId,
        activo: true,
      },
      orderBy: {
        vistaEn: "desc",
      },
      include: {
        inmueble: {
          include: {
            publicaciones: {
              where: {
                estado: EstadoPublicacion.ACTIVA,
              },
              include: {
                multimedia: true,
              },
            },
            ubicacion: true,
          },
        },
      },
    });

    const publicacionesIds = vistas
      .map((vista) => vista.inmueble.publicaciones[0]?.id)
      .filter((id): id is number => typeof id === "number");

    const estadisticas = await prisma.publicacion_estadistica.findMany({
      where: {
        publicacion_id: {
          in: publicacionesIds,
        },
      },
      select: {
        publicacion_id: true,
        total_visualizaciones: true,
        total_compartidos: true,
      },
    });

    const estadisticasPorPublicacion = new Map<
      number,
      {
        publicacion_id: number;
        total_visualizaciones: number;
        total_compartidos: number;
      }
    >();

    estadisticas.forEach((estadistica) => {
      estadisticasPorPublicacion.set(estadistica.publicacion_id, estadistica);
    });

    return vistas.map((vista) => {
      const publicacionActiva = vista.inmueble.publicaciones[0];

      const estadistica = publicacionActiva
        ? estadisticasPorPublicacion.get(publicacionActiva.id)
        : undefined;

      return {
        propiedadVistaId: vista.id,
        inmuebleId: vista.inmuebleId,
        publicacionId: publicacionActiva?.id || null,
        titulo: vista.inmueble.titulo,
        descripcion: vista.inmueble.descripcion,
        precio: Number(vista.inmueble.precio),
        categoria: vista.inmueble.categoria,
        tipoAccion: vista.inmueble.tipoAccion,
        zona: vista.inmueble.ubicacion?.zona || null,
        ciudad: vista.inmueble.ubicacion?.ciudad || null,
        imagen:
          publicacionActiva?.multimedia?.find((item) => item.tipo === "IMAGEN")
            ?.url || null,
        vecesVisto: vista.veces_visto || 1,
        ultimaVista: vista.vistaEn,
        totalVisualizaciones: estadistica?.total_visualizaciones ?? 0,
        totalCompartidos: estadistica?.total_compartidos ?? 0,
      };
    });
  }
}
