import { prisma } from "../../lib/prisma.client.js";

const ESTADO_PUBLICACION_ELIMINADA = "ELIMINADA" as const;
const ESTADO_INMUEBLE_INACTIVO = "INACTIVO" as const;

type TipoAccionValue = "VENTA" | "ALQUILER" | "ANTICRETO";

type ActualizarPublicacionInput = {
  titulo?: unknown;
  title?: unknown;
  descripcion?: unknown;
  details?: unknown;
  tipoAccion?: unknown;
  operationType?: unknown;
  ubicacion?: unknown;
  location?: unknown;
  precio?: unknown;
  price?: unknown;
};

export const buscarPublicacionesPorUsuarioRepository = async (
  usuarioId: number,
) => {
  return prisma.publicacion.findMany({
    where: {
      usuario_id: usuarioId,
      estado: {
        not: ESTADO_PUBLICACION_ELIMINADA,
      },
    },
    include: {
      multimedia: true,
      inmueble: {
        include: { ubicacion: {
            select: {
              id: true,
              direccion: true,
              latitud: true,
              longitud: true,
              inmueble_id: true,
              ubicacion_maestra_id: true,
            },
          },
        },
      },
    },
    orderBy: {
      fecha_publicacion: "desc",
    },
  });
};

export const buscarPublicacionPorIdRepository = async (id: number) => {
  return prisma.publicacion.findUnique({
    where: { id },
    include: {
      inmueble: {
        include: { ubicacion: true,
        },
      },
      multimedia: true,
    },
  });
};

export const buscarResumenFinalPorIdRepository = async (
  publicacionId: number,
) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      estado: true,
      fecha_publicacion: true,
      usuario_id: true,
      inmueble_id: true,
      inmueble: {
        select: {
          id: true,
          titulo: true,
          tipo_accion: true,
          categoria: true,
          precio: true,
          superficie_m2: true,
          nro_cuartos: true,
          nro_banos: true,
          descripcion: true,
          estado: true,
          ubicacion: {
            select: {
              direccion: true,
              ciudad: true,
              zona: true,
              latitud: true,
              longitud: true,
            },
          },
          inmueble_etiqueta: {
            select: {
              etiqueta: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      multimedia: {
        select: {
          id: true,
          url: true,
          tipo: true,
          peso_mb: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });
};

export const actualizarPublicacionRepository = async (
  publicacionId: number,
  data: ActualizarPublicacionInput,
) => {
  const tituloRaw = data.titulo ?? data.title;
  const descripcionRaw = data.descripcion ?? data.details;
  const tipoAccionRaw = data.tipoAccion ?? data.operationType;
  const direccionRaw = data.ubicacion ?? data.location;
  const precioRaw = data.precio ?? data.price;

  const dataToUpdate: {
    titulo?: string;
    descripcion?: string;
        inmueble?: {
          update: {
            tipo_accion?: TipoAccionValue;
            precio?: number;
            ubicacion_inmueble?: {
              update: {
                direccion: string;
              };
            };
          };
        };
      } = {};

  const inmuebleData: {
    tipo_accion?: TipoAccionValue;
    precio?: number;
    ubicacion?: {
      update: {
        direccion: string;
      };
    };
  } = {};

  if (tituloRaw !== undefined) {
    dataToUpdate.titulo = String(tituloRaw).trim();
  }

  if (descripcionRaw !== undefined) {
    dataToUpdate.descripcion = String(descripcionRaw).trim();
  }

  if (tipoAccionRaw !== undefined) {
    inmuebleData.tipo_accion = String(tipoAccionRaw)
      .trim()
      .toUpperCase() as TipoAccionValue;
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== "" &&
    !Number.isNaN(Number(precioRaw))
  ) {
    inmuebleData.precio = Number(precioRaw);
  }

  if (direccionRaw !== undefined) {
    inmuebleData.ubicacion = {
      update: {
        direccion: String(direccionRaw).trim(),
      },
    };
  }

  if (Object.keys(inmuebleData).length > 0) {
    dataToUpdate.inmueble = {
      update: inmuebleData,
    };
  }

  return prisma.publicacion.update({
    where: { id: publicacionId },
    data: dataToUpdate,
    include: {
      multimedia: true,
      inmueble: {
        include: { ubicacion: true,
        },
      },
    },
  });
};

export const eliminarLogicamentePublicacionRepository = async (
  publicacionId: number,
  inmuebleId: number,
) => {
  return prisma.$transaction([
    prisma.publicacion.update({
      where: { id: publicacionId },
      data: {
        estado: ESTADO_PUBLICACION_ELIMINADA,
      },
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: ESTADO_INMUEBLE_INACTIVO,
      },
    }),
  ]);
};

export const buscarDetallePublicacionPorIdRepository = async (
  publicacionId: number,
) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      estado: true,
      fecha_publicacion: true,
      usuario_id: true,
      inmueble_id: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono_telefono_usuario_idTousuario: {
            select: {
              codigoPais: true,
              numero: true,
              principal: true,
            },
          },
        },
      },
      inmueble: {
        select: {
          id: true,
          titulo: true,
          tipo_accion: true,
          categoria: true,
          precio: true,
          superficie_m2: true,
          nro_cuartos: true,
          nro_banos: true,
          descripcion: true,
          estado: true,
          ubicacion: {
            select: {
              direccion: true,
              latitud: true,
              longitud: true,
              inmueble_id: true,
              ubicacion_maestra_id: true,
            },
          },
          inmueble_etiqueta: {
            select: {
              etiqueta: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      multimedia: {
        select: {
          id: true,
          url: true,
          tipo: true,
          peso_mb: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });
};

export const buscarDetallePublicacionPorInmuebleIdRepository = async (
  inmuebleId: number,
) => {
  return prisma.publicacion.findFirst({
    where: {
      inmueble_id: inmuebleId,
      estado: {
        not: "ELIMINADA",
      },
    },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      estado: true,
      fecha_publicacion: true,
      usuario_id: true,
      inmueble_id: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono_telefono_usuario_idTousuario: {
            select: {
              codigoPais: true,
              numero: true,
              principal: true,
            },
          },
        },
      },
      inmueble: {
        select: {
          id: true,
          titulo: true,
          tipo_accion: true,
          categoria: true,
          precio: true,
          precio_anterior: true,
          superficie_m2: true,
          nro_cuartos: true,
          nro_banos: true,
          descripcion: true,
          estado: true,
          ubicacion: {
            select: {
              direccion: true,
              latitud: true,
              longitud: true,
            },
          },

          inmueble_etiqueta: {
            select: {
              etiqueta: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      multimedia: {
        select: {
          id: true,
          url: true,
          tipo: true,
          peso_mb: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });
};

export const confirmarPublicacionRepository = async (publicacionId: number) => {
  return prisma.publicacion.update({
    where: { id: publicacionId },
    data: {
      estado: "ACTIVA",
    },
    include: {
      multimedia: true,
      inmueble: {
        include: { ubicacion: true,
        },
      },
    },
  });
};

type NuevaMultimediaInput = {
  url: string;
  tipo: "IMAGEN" | "VIDEO";
  peso_mb?: number | null;
  publicacion_id: number;
};

export const eliminarMultimediaPorIdsRepository = async (
  publicacionId: number,
  multimediaIds: number[],
) => {
  if (multimediaIds.length === 0) return { count: 0 };

  return prisma.multimedia.deleteMany({
    where: {
      id: {
        in: multimediaIds,
      },
      publicacion_id: publicacionId,
    },
  });
};

export const eliminarVideosDePublicacionRepository = async (
  publicacionId: number,
) => {
  return prisma.multimedia.deleteMany({
    where: {
      publicacion_id: publicacionId,
      tipo: "VIDEO",
    },
  });
};

export const crearMultimediaRepository = async (
  data: NuevaMultimediaInput[],
) => {
  if (data.length === 0) return { count: 0 };

  return prisma.multimedia.createMany({
    data,
  });
};

export const buscarMultimediaPublicacionRepository = async (
  publicacionId: number,
) => {
  return prisma.multimedia.findMany({
    where: {
      publicacion_id: publicacionId,
    },
    orderBy: {
      id: "asc",
    },
  });
};
// ==================== NUEVOS REPOSITORIOS PARA HU-11 ====================
// PUBLICIDAD DE PROPIEDADES

export const activarPublicidadRepository = async (
  publicacionId: number,
  usuarioId: number,
  paymentIntentId: string,
  duracionDias: number = 30
) => {
  const fecha_inicio = new Date();
  const fecha_expiracion = new Date();
  fecha_expiracion.setDate(fecha_expiracion.getDate() + duracionDias);

  return prisma.publicacion.update({
    where: {
      id: publicacionId,
      usuario_id: usuarioId,
    },
    data: {
      promoted: true,
      promotedAt: fecha_inicio,
      promotedExpiresAt: fecha_expiracion,
      payment_intent_id: paymentIntentId,
    },
  });
};

export const cancelarPublicidadRepository = async (
  publicacionId: number,
  usuarioId: number
) => {
  return prisma.publicacion.update({
    where: {
      id: publicacionId,
      usuario_id: usuarioId,
    },
    data: {
      promoted: false,
      promotedAt: null,
      promotedExpiresAt: null,
      payment_intent_id: null,
    },
  });
};

export const buscarPublicacionPorIdSimpleRepository = async (
  publicacionId: number
) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      promoted: true,
      promotedAt: true,
      promotedExpiresAt: true,
    },
  });
};

export const verificarPublicidadActivaRepository = async (
  publicacionId: number
) => {
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      promoted: true,
      promotedExpiresAt: true,
    },
  });

  if (!publicacion) return false;

  return (
    publicacion.promoted === true &&
    publicacion.promotedExpiresAt !== null &&
    new Date(publicacion.promotedExpiresAt) > new Date()
  );
};


