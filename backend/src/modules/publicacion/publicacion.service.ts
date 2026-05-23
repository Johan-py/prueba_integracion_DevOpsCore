import { prisma } from "../../lib/prisma.client.js";
import {
  buscarPublicacionesPorUsuarioRepository,
  buscarPublicacionPorIdRepository,
  buscarResumenFinalPorIdRepository,
  actualizarPublicacionRepository,
  eliminarLogicamentePublicacionRepository,
  buscarDetallePublicacionPorIdRepository,
  confirmarPublicacionRepository,
  buscarDetallePublicacionPorInmuebleIdRepository,
  eliminarMultimediaPorIdsRepository,
  eliminarVideosDePublicacionRepository,
  crearMultimediaRepository,
  buscarMultimediaPublicacionRepository,
   // ==================== NUEVAS IMPORTACIONES HU-11 ====================
  activarPublicidadRepository,
  cancelarPublicidadRepository,
  buscarPublicacionPorIdSimpleRepository,
  verificarPublicidadActivaRepository,
} from "./publicacion.repository.js";
import { cloudinary } from "../../config/cloudinary.js";

type TipoAccionPermitido = "VENTA" | "ALQUILER" | "ANTICRETO";

type EditarPublicacionInput = {
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

type ResumenFinalRepositoryResult = NonNullable<
  Awaited<ReturnType<typeof buscarResumenFinalPorIdRepository>>
>;

type ParametroPersonalizadoDb =
  ResumenFinalRepositoryResult["inmueble"] extends {
    inmueble_etiqueta: Array<infer T>;
  }
    ? T
    : never;

type MultimediaDb =
  ResumenFinalRepositoryResult["multimedia"] extends Array<infer T> ? T : never;

type ParametroPersonalizadoResumen = {
  id: number;
  nombre: string;
};

type MultimediaResumen = {
  id: number;
  url: string;
  tipo: string;
  peso_mb: number | null;
};

type EstadisticaPublicacionResumen = {
  publicacion_id: number;
  total_visualizaciones: number;
  total_compartidos: number;
};

const ESTADO_PUBLICACION_ELIMINADA = "ELIMINADA";
const TIPO_MULTIMEDIA_IMAGEN = "IMAGEN";
const TIPO_MULTIMEDIA_VIDEO = "VIDEO";
const TIPOS_ACCION_VALIDOS: TipoAccionPermitido[] = [
  "VENTA",
  "ALQUILER",
  "ANTICRETO",
];

const normalizarTexto = (valor: unknown) => String(valor ?? "").trim();

const normalizarTipoMultimedia = (tipo: unknown) =>
  normalizarTexto(tipo).toUpperCase();

const esNumeroPositivo = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === "") {
    return false;
  }

  const numero = Number(valor);
  return !Number.isNaN(numero) && numero > 0;
};

const obtenerTipoAccionNormalizado = (
  valor: unknown,
): TipoAccionPermitido | null => {
  const tipoAccion = normalizarTexto(valor).toUpperCase();

  if (!tipoAccion) {
    return null;
  }

  return TIPOS_ACCION_VALIDOS.includes(tipoAccion as TipoAccionPermitido)
    ? (tipoAccion as TipoAccionPermitido)
    : null;
};

const obtenerPrimeraImagenUrl = (
  multimedia:
    | Array<{
        url: string;
        tipo?: unknown;
      }>
    | null
    | undefined,
) => {
  if (!multimedia || multimedia.length === 0) {
    return null;
  }

  const primeraImagen = multimedia.find(
    (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN,
  );

  return primeraImagen?.url ?? null;
};

export const listarMisPublicacionesService = async (usuario_id: number) => {
  if (Number.isNaN(usuario_id) || usuario_id <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicaciones =
    await buscarPublicacionesPorUsuarioRepository(usuario_id);

  type PublicacionesPorUsuario = Awaited<
    ReturnType<typeof buscarPublicacionesPorUsuarioRepository>
  >;

  const publicacionesIds = publicaciones.map((publicacion) => publicacion.id);

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
    EstadisticaPublicacionResumen
  >();

  estadisticas.forEach((estadistica) => {
    estadisticasPorPublicacion.set(estadistica.publicacion_id, estadistica);
  });

  return publicaciones.map((publicacion: PublicacionesPorUsuario[number]) => {
    const estadistica = estadisticasPorPublicacion.get(publicacion.id);

    return {
      id: publicacion.id,
      titulo: publicacion.titulo,
      precio: Number(publicacion.inmueble.precio),
      ubicacion:
        publicacion.inmueble.ubicacion_inmueble?.direccion || "Ubicación no disponible",
      nro_banos: publicacion.inmueble.nro_banos,
      nro_cuartos: publicacion.inmueble.nro_cuartos,
      superficie_m2:
        publicacion.inmueble.superficie_m2 !== null &&
        publicacion.inmueble.superficie_m2 !== undefined
          ? Number(publicacion.inmueble.superficie_m2)
          : null,
      imagenUrl: obtenerPrimeraImagenUrl(publicacion.multimedia),

      tipoOperacion: publicacion.inmueble.tipo_accion,
      activa: publicacion.estado === "ACTIVA",
      estado: publicacion.estado,

      totalVisualizaciones: estadistica?.total_visualizaciones ?? 0,
      totalCompartidos: estadistica?.total_compartidos ?? 0,
    };
  });
};

export const editarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
  data: EditarPublicacionInput,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  const titulo = data?.titulo ?? data?.title;
  const descripcion = data?.descripcion ?? data?.details;
  const tipoAccion = data?.tipoAccion ?? data?.operationType;
  const ubicacion = data?.ubicacion ?? data?.location;
  const precioRaw = data?.precio ?? data?.price;

  if (titulo !== undefined && !normalizarTexto(titulo)) {
    throw new Error("TITULO_INVALIDO");
  }

  if (descripcion !== undefined && !normalizarTexto(descripcion)) {
    throw new Error("DESCRIPCION_INVALIDA");
  }

  if (ubicacion !== undefined && !normalizarTexto(ubicacion)) {
    throw new Error("UBICACION_INVALIDA");
  }

  if (tipoAccion !== undefined) {
    const tipoAccionNormalizado = obtenerTipoAccionNormalizado(tipoAccion);

    if (!tipoAccionNormalizado) {
      throw new Error("TIPO_ACCION_INVALIDO");
    }
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== "" &&
    !esNumeroPositivo(precioRaw)
  ) {
    throw new Error("PRECIO_INVALIDO");
  }

  const payloadNormalizado: Record<string, unknown> = {
    ...(data as Record<string, unknown>),
  };

  if (titulo !== undefined) {
    payloadNormalizado.titulo = normalizarTexto(titulo);
  }

  if (descripcion !== undefined) {
    payloadNormalizado.descripcion = normalizarTexto(descripcion);
  }

  if (ubicacion !== undefined) {
    payloadNormalizado.ubicacion = normalizarTexto(ubicacion);
  }

  if (tipoAccion !== undefined) {
    payloadNormalizado.tipoAccion = obtenerTipoAccionNormalizado(tipoAccion);
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== "" &&
    esNumeroPositivo(precioRaw)
  ) {
    payloadNormalizado.precio = Number(precioRaw);
  }

  const actualizada = await actualizarPublicacionRepository(
    publicacionId,
    payloadNormalizado,
  );

  return {
    id: actualizada.id,
    titulo: actualizada.titulo,
    descripcion: actualizada.descripcion,
    precio: Number(actualizada.inmueble.precio),
    tipoAccion: actualizada.inmueble.tipo_accion,
    ubicacion:
      actualizada.inmueble.ubicacion_inmueble?.direccion || "Ubicación no disponible",
    imagenUrl: obtenerPrimeraImagenUrl(actualizada.multimedia),
  };
};

export const eliminarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  await eliminarLogicamentePublicacionRepository(
    publicacion.id,
    publicacion.inmueble_id,
  );

  return {
    id: publicacion.id,
    estado: ESTADO_PUBLICACION_ELIMINADA,
  };
};

export const obtenerResumenFinalService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const resumen = await buscarResumenFinalPorIdRepository(publicacionId);

  if (!resumen) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (resumen.usuario_id !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (resumen.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  const parametrosPersonalizados: ParametroPersonalizadoResumen[] = (
    resumen.inmueble?.inmueble_etiqueta ?? []
  ).map((item: ParametroPersonalizadoDb) => ({
    id: item.etiqueta.id,
    nombre: item.etiqueta.nombre,
  }));

  const parametrosUnicos = parametrosPersonalizados.filter(
    (
      parametro: ParametroPersonalizadoResumen,
      index: number,
      array: ParametroPersonalizadoResumen[],
    ) => array.findIndex((item) => item.id === parametro.id) === index,
  );

  const multimedia: MultimediaResumen[] = (resumen.multimedia ?? []).map(
    (item: MultimediaDb) => ({
      id: item.id,
      url: item.url,
      tipo: normalizarTipoMultimedia(item.tipo),
      peso_mb:
        item.peso_mb !== null && item.peso_mb !== undefined
          ? Number(item.peso_mb)
          : null,
    }),
  );

  const imagenes = multimedia.filter(
    (item: MultimediaResumen) => item.tipo === TIPO_MULTIMEDIA_IMAGEN,
  );

  const videos = multimedia.filter(
    (item: MultimediaResumen) => item.tipo === TIPO_MULTIMEDIA_VIDEO,
  );

  return {
    id: resumen.id,
    publicacionId: resumen.id,
    inmueble_id: resumen.inmueble_id,

    publicacion: {
      titulo: resumen.titulo ?? resumen.inmueble?.titulo ?? null,
      descripcion: resumen.descripcion ?? resumen.inmueble?.descripcion ?? null,
      estado: resumen.estado,
      fecha_publicacion: resumen.fecha_publicacion,
    },

    datosGenerales: {
      tipoOperacion: resumen.inmueble?.tipo_accion ?? null,
      tipoInmueble: resumen.inmueble?.categoria ?? null,
      direccion: resumen.inmueble?.ubicacion_inmueble?.direccion ?? "No especificado",
      ciudad: resumen.inmueble?.ubicacion_inmueble?.ciudad ?? "No especificado",
      zona: resumen.inmueble?.ubicacion_inmueble?.zona ?? "No especificado",
      precio:
        resumen.inmueble?.precio !== null &&
        resumen.inmueble?.precio !== undefined
          ? Number(resumen.inmueble.precio)
          : null,
      areaM2:
        resumen.inmueble?.superficie_m2 !== null &&
        resumen.inmueble?.superficie_m2 !== undefined
          ? Number(resumen.inmueble.superficie_m2)
          : null,
      coordenadas: {
        latitud: resumen.inmueble?.ubicacion_inmueble?.latitud ?? null,
        longitud: resumen.inmueble?.ubicacion_inmueble?.longitud ?? null,
      },
    },

    caracteristicas: {
      habitaciones: resumen.inmueble?.nro_cuartos ?? null,
      banos: resumen.inmueble?.nro_banos ?? null,
      estacionamiento: null,
    },

    parametrosPersonalizados: parametrosUnicos,

    multimedia: {
      total: multimedia.length,
      imagenes,
      videos,
    },

    soloLectura: true,
  };
};

export const obtenerDetallePublicacionService = async (
  publicacionId: number,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  const publicacion =
    await buscarDetallePublicacionPorIdRepository(publicacionId);

  if (!publicacion || publicacion.estado === "ELIMINADA") {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  const telefonoPrincipal =
    publicacion.usuario.telefono_telefono_usuarioIdTousuario.find((item) => item.principal) ??
    publicacion.usuario.telefono_telefono_usuarioIdTousuario[0];

  return {
    id: publicacion.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    tipoInmueble: publicacion.inmueble.categoria ?? null,
    tipoOperacion: publicacion.inmueble.tipo_accion,
    ubicacionTexto:
      publicacion.inmueble.ubicacion_inmueble?.direccion || "Ubicación no disponible",
    descripcion:
      publicacion.descripcion ||
      publicacion.inmueble.descripcion ||
      "Sin descripción disponible",
    imagenes: publicacion.multimedia
      .filter(
        (item) =>
          normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN,
      )
      .map((item) => ({
        id: item.id,
        url: item.url,
        tipo: item.tipo,
        peso_mb: item.peso_mb ? Number(item.peso_mb) : null,
      })),
    videoUrl:
      publicacion.multimedia.find(
        (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO,
      )?.url ?? null,
    videoUrls: publicacion.multimedia
      .filter(
        (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO,
      )
      .map((item) => item.url),
    detalles: {
      habitaciones: publicacion.inmueble.nro_cuartos ?? null,
      banos: publicacion.inmueble.nro_banos ?? null,
      superficieUtil: publicacion.inmueble.superficie_m2
        ? Number(publicacion.inmueble.superficie_m2)
        : null,
    },
    caracteristicasAdicionales:
      publicacion.inmueble.inmueble_etiqueta?.map(
        (item) => item.etiqueta.nombre,
      ) ?? [],
    mapa: {
      latitud: publicacion.inmueble.ubicacion_inmueble?.latitud
        ? Number(publicacion.inmueble.ubicacion_inmueble.latitud)
        : null,
      longitud: publicacion.inmueble.ubicacion_inmueble?.longitud
        ? Number(publicacion.inmueble.ubicacion_inmueble.longitud)
        : null,
      direccion: publicacion.inmueble.ubicacion_inmueble?.direccion || null,
    },
    contacto: {
      nombre: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
      correo: publicacion.usuario.correo ?? null,
      telefono: telefonoPrincipal
        ? `${telefonoPrincipal.codigoPais} ${telefonoPrincipal.numero}`
        : null,
    },
  };
};

export const obtenerDetallePublicacionPorInmuebleService = async (
  inmueble_id: number,
) => {
  if (Number.isNaN(inmueble_id) || inmueble_id <= 0) {
    throw new Error("ID_INVALIDO");
  }

  const publicacion =
    await buscarDetallePublicacionPorInmuebleIdRepository(inmueble_id);

  if (!publicacion || publicacion.estado === "ELIMINADA") {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  const telefonoPrincipal =
    publicacion.usuario.telefono_telefono_usuarioIdTousuario.find((item) => item.principal) ??
    publicacion.usuario.telefono_telefono_usuarioIdTousuario[0];

  return {
    id: publicacion.id,
    inmueble_id: publicacion.inmueble.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    //HU6-precio Anterior
    precio_anterior: publicacion.inmueble.precio_anterior
      ? Number(publicacion.inmueble.precio_anterior)
      : undefined,
    tipoInmueble: publicacion.inmueble.categoria ?? null,
    tipoOperacion: publicacion.inmueble.tipo_accion,
    ubicacionTexto:
      publicacion.inmueble.ubicacion_inmueble?.direccion || "Ubicación no disponible",
    descripcion:
      publicacion.descripcion ||
      publicacion.inmueble.descripcion ||
      "Sin descripción disponible",
    imagenes: publicacion.multimedia
      .filter(
        (item) =>
          normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN,
      )
      .map((item) => ({
        id: item.id,
        url: item.url,
        tipo: item.tipo,
        peso_mb: item.peso_mb ? Number(item.peso_mb) : null,
      })),
    videoUrl:
     publicacion.multimedia.find(
      (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO,
     )?.url ?? null,
     videoUrls: publicacion.multimedia
       .filter(
        (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO,
      )
       .map((item) => item.url),
      detalles: {
      habitaciones: publicacion.inmueble.nro_cuartos ?? null,
      banos: publicacion.inmueble.nro_banos ?? null,
      superficieUtil: publicacion.inmueble.superficie_m2
        ? Number(publicacion.inmueble.superficie_m2)
        : null,
    },
    caracteristicasAdicionales:
      publicacion.inmueble.inmueble_etiqueta?.map(
        (item) => item.etiqueta.nombre,
      ) ?? [],
    mapa: {
      latitud: publicacion.inmueble.ubicacion_inmueble?.latitud
        ? Number(publicacion.inmueble.ubicacion_inmueble.latitud)
        : null,
      longitud: publicacion.inmueble.ubicacion_inmueble?.longitud
        ? Number(publicacion.inmueble.ubicacion_inmueble.longitud)
        : null,
      direccion: publicacion.inmueble.ubicacion_inmueble?.direccion || null,
    },

    contacto: {
      nombre: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
      correo: publicacion.usuario.correo ?? null,
      telefono: telefonoPrincipal
        ? `${telefonoPrincipal.codigoPais} ${telefonoPrincipal.numero}`
        : null,
    },
  };
};

export const confirmarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  if (!publicacion.multimedia || publicacion.multimedia.length === 0) {
    throw new Error("MULTIMEDIA_REQUERIDA");
  }

  const publicacionConfirmada = await confirmarPublicacionRepository(
    publicacion.id,
  );

  return {
    id: publicacionConfirmada.id,
    estado: publicacionConfirmada.estado,
    fecha_publicacion: publicacionConfirmada.fecha_publicacion,
    multimediaTotal: publicacionConfirmada.multimedia.length,
  };
};

type EditarMultimediaInput = {
  imagenesAEliminar?: unknown;
  videoUrl?: unknown;
};

const esVideoPermitido = (url: string) => {
  const valor = url.trim();

  if (!valor) return true;

  return (
    valor.includes("youtube.com") ||
    valor.includes("youtu.be") ||
    valor.includes("vimeo.com")
  );
};

const parseImagenesAEliminar = (valor: unknown): number[] => {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor
      .map((item) => Number(item))
      .filter((item) => !Number.isNaN(item) && item > 0);
  }

  if (typeof valor === "string") {
    try {
      const parsed = JSON.parse(valor);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => Number(item))
          .filter((item) => !Number.isNaN(item) && item > 0);
      }
    } catch {
      const numero = Number(valor);
      return !Number.isNaN(numero) && numero > 0 ? [numero] : [];
    }
  }

  return [];
};

const subirImagenACloudinary = async (
  file: Express.Multer.File,
): Promise<string> => {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const resultado = await cloudinary.uploader.upload(dataUri, {
    folder: "propbol/publicaciones",
    resource_type: "image",
  });

  return resultado.secure_url;
};

export const editarMultimediaPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
  data: EditarMultimediaInput & {
    imagenesActuales?: unknown;
    imagenesNuevas?: unknown;
    videoUrls?: unknown;
  },
  archivos: Express.Multer.File[],
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  const parseStringArray = (valor: unknown): string[] => {
    if (!valor) return [];

    if (Array.isArray(valor)) {
      return valor.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof valor === "string") {
      try {
        const parsed = JSON.parse(valor);

        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        return valor.trim() ? [valor.trim()] : [];
      }
    }

    return [];
  };

  const subirBase64ACloudinary = async (base64: string) => {
    const resultado = await cloudinary.uploader.upload(base64, {
      folder: "propbol/publicaciones",
      resource_type: "image",
    });

    return resultado.secure_url;
  };

  const imagenesActualesUrls = parseStringArray(data.imagenesActuales);
  const imagenesNuevasBase64 = parseStringArray(data.imagenesNuevas);
  const videosUrls = parseStringArray(data.videoUrls);
  const videoUrlLegacy = normalizarTexto(data.videoUrl);

  const videosFinales =
    videosUrls.length > 0
      ? videosUrls.slice(0, 2)
      : videoUrlLegacy
        ? [videoUrlLegacy]
        : [];

  const imagenesActualesDb = publicacion.multimedia.filter(
    (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN,
  );

  const imagenesAEliminarPorUrl = imagenesActualesDb
    .filter((item) => !imagenesActualesUrls.includes(item.url))
    .map((item) => item.id);

  const imagenesAEliminarPorId = parseImagenesAEliminar(data.imagenesAEliminar);

  const imagenesAEliminar = Array.from(
    new Set([...imagenesAEliminarPorUrl, ...imagenesAEliminarPorId]),
  );

  const totalImagenesDespues =
    imagenesActualesDb.length -
    imagenesAEliminar.length +
    archivos.length +
    imagenesNuevasBase64.length;

  if (totalImagenesDespues <= 0) {
    throw new Error("MINIMO_UNA_IMAGEN");
  }

  if (totalImagenesDespues > 5) {
    throw new Error("LIMITE_IMAGENES");
  }

  await eliminarMultimediaPorIdsRepository(publicacionId, imagenesAEliminar);

  const nuevasImagenesDesdeArchivos = await Promise.all(
    archivos.map(async (file) => {
      const url = await subirImagenACloudinary(file);

      return {
        url,
        tipo: "IMAGEN" as const,
        peso_mb: Number((file.size / 1024 / 1024).toFixed(2)),
        publicacion_id: publicacionId,
      };
    }),
  );

  const nuevasImagenesDesdeBase64 = await Promise.all(
    imagenesNuevasBase64.map(async (base64) => {
      const url = await subirBase64ACloudinary(base64);

      return {
        url,
        tipo: "IMAGEN" as const,
        peso_mb: null,
        publicacion_id: publicacionId,
      };
    }),
  );

  await crearMultimediaRepository([
    ...nuevasImagenesDesdeArchivos,
    ...nuevasImagenesDesdeBase64,
  ]);

  const videosValidos = videosFinales.every((video) => esVideoPermitido(video));

  if (videosValidos) {
    await eliminarVideosDePublicacionRepository(publicacionId);

    if (videosFinales.length > 0) {
      await crearMultimediaRepository(
        videosFinales.map((video) => ({
          url: video,
          tipo: "VIDEO" as const,
          peso_mb: null,
          publicacion_id: publicacionId,
        })),
      );
    }
  }

  const multimediaActualizada =
    await buscarMultimediaPublicacionRepository(publicacionId);

  const imagenes = multimediaActualizada.filter(
    (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN,
  );

  const videos = multimediaActualizada.filter(
    (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO,
  );

  return {
    id: publicacionId,
    imagenes: imagenes.map((item) => ({
      id: item.id,
      url: item.url,
      tipo: item.tipo,
      peso_mb: item.peso_mb ? Number(item.peso_mb) : null,
    })),
    videoUrl: videos[0]?.url ?? null,
    videoUrls: videos.map((item) => item.url),
    videoError: videosValidos ? null : "VIDEO_INVALIDO",
  };
};
// ==================== NUEVOS SERVICIOS HU-11 ====================
// PUBLICIDAD DE PROPIEDADES

export const iniciarPublicidadService = async (
  publicacionId: number,
  usuario_id: number
): Promise<{ checkoutUrl: string }> => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuario_id) || usuario_id <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuario_id) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  // Verificar si ya tiene publicidad activa
  const yaPublicitada = await verificarPublicidadActivaRepository(
    publicacionId
  );
  if (yaPublicitada) {
    throw new Error("PUBLICACION_YA_PUBLICITADA");
  }

  // SIMULACIÓN - Reemplazar con integración real de pagos después
  const checkoutUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/pago?publicacion=${publicacionId}&monto=9.99`;

  return { checkoutUrl };
};

export const confirmarPublicidadService = async (
  publicacionId: number,
  usuario_id: number,
  paymentIntentId: string,
  planId?: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuario_id) || usuario_id <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  if (!paymentIntentId || paymentIntentId.trim() === "") {
    throw new Error("PAYMENT_INTENT_REQUERIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuario_id) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  // Duración según el plan seleccionado (por defecto 30 días)
  let duracionDias = 30;
  if (planId === 2) {
    duracionDias = 60; // Plan Premium
  }

  const publicacionActualizada = await activarPublicidadRepository(
    publicacionId,
    usuario_id,
    paymentIntentId,
    duracionDias
  );

  return {
    id: publicacionActualizada.id,
    promoted: publicacionActualizada.promoted,
    promotedAt: publicacionActualizada.promotedAt,
    promotedExpiresAt: publicacionActualizada.promotedExpiresAt,
    message: `Publicidad activada correctamente por ${duracionDias} días`,
  };
};

export const cancelarPublicidadService = async (
  publicacionId: number,
  usuario_id: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuario_id) || usuario_id <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuario_id !== usuario_id) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  if (!publicacion.promoted) {
    throw new Error("PUBLICACION_NO_PUBLICITADA");
  }

  const publicacionActualizada = await cancelarPublicidadRepository(
    publicacionId,
    usuario_id
  );

  return {
    id: publicacionActualizada.id,
    promoted: false,
    message: "Publicidad cancelada correctamente",
  };
};

export const obtenerEstadoPublicidadService = async (publicacionId: number) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdSimpleRepository(
    publicacionId
  );

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  const activa =
    publicacion.promoted === true &&
    publicacion.promotedExpiresAt !== null &&
    new Date(publicacion.promotedExpiresAt) > new Date();

  return {
    id: publicacion.id,
    promoted: activa,
    promotedAt: activa ? publicacion.promotedAt : null,
    promotedExpiresAt: activa ? publicacion.promotedExpiresAt : null,
  };
};
