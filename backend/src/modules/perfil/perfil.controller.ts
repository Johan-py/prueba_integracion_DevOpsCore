import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.client.js";
import { publicacionesService } from "../publicaciones/publicaciones.service.js";

interface AuthRequest extends Request {
  usuario?: {
    id: number;
    nombre?: string;
    rol?: string;
  };
}

// Obtener perfil completo del usuario
export const obtenerPerfil = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        avatar: true,
        pais: true,
        genero: true,
        direccion: true,
        telefonos: true,
        fecha_nacimiento: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Mapear género a formato legible
    const generoMap: { [key: string]: string } = {
      MASCULINO: "Masculino",
      FEMENINO: "Femenino",
      OTRO: "Otro",
    };

    const perfilFormateado = {
      ...usuario,
      genero: usuario.genero ? generoMap[usuario.genero] : null,
    };

    return res.json({
      ok: true,
      perfil: perfilFormateado,
    });
  } catch (error) {
    console.error("Error en obtenerPerfil:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener el perfil" });
  }
};

// Editar nombre
export const editarNombre = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { nombre } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ ok: false, msg: "El nombre es requerido" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { nombre: nombre.trim() },
    });

    return res.json({
      ok: true,
      msg: "Nombre actualizado exitosamente",
      nombre: usuarioActualizado.nombre,
    });
  } catch (error) {
    console.error("Error en editarNombre:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar el nombre",
    });
  }
};

// Editar país
export const editarPais = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { pais } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    // Si pais es undefined o string vacío, guardar null
    const paisActualizado = pais && pais.trim() !== "" ? pais : null;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { pais: paisActualizado },
    });

    return res.json({
      ok: true,
      msg: "País actualizado exitosamente",
      pais: usuarioActualizado.pais,
    });
  } catch (error) {
    console.error("Error en editarPais:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar el país",
    });
  }
};

// Editar género - también devuelve el valor mapeado
export const editarGenero = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { genero } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    // Mapeo de valores del frontend a los valores del enum en MAYÚSCULAS
    const enumMap: { [key: string]: string } = {
      Masculino: "MASCULINO",
      Femenino: "FEMENINO",
      Otro: "OTRO",
    };

    let generoActualizado = null;

    if (genero && enumMap[genero]) {
      generoActualizado = enumMap[genero];
    } else if (genero && !enumMap[genero]) {
      return res.status(400).json({
        ok: false,
        msg: "Género inválido. Valores permitidos: Masculino, Femenino, Otro",
      });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { genero: generoActualizado as any },
    });

    // Mapear de vuelta para la respuesta
    const generoResponseMap: { [key: string]: string } = {
      MASCULINO: "Masculino",
      FEMENINO: "Femenino",
      OTRO: "Otro",
    };

    const generoRespuesta = usuarioActualizado.genero
      ? generoResponseMap[usuarioActualizado.genero]
      : null;

    return res.json({
      ok: true,
      msg: "Género actualizado exitosamente",
      genero: generoRespuesta,
    });
  } catch (error) {
    console.error("Error en editarGenero:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar el género",
    });
  }
};
// Editar dirección
export const editarDireccion = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { direccion } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    // Si direccion es undefined o string vacío, guardar null
    const direccionActualizada =
      direccion && direccion.trim() !== "" ? direccion : null;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { direccion: direccionActualizada },
    });

    return res.json({
      ok: true,
      msg: "Dirección actualizada exitosamente",
      direccion: usuarioActualizado.direccion,
    });
  } catch (error) {
    console.error("Error en editarDireccion:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar la dirección",
    });
  }
};

// Editar foto de perfil
export const editarFotoPerfil = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        msg: "No se ha subido ninguna imagen",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fotoUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatar: fotoUrl },
    });

    return res.json({
      ok: true,
      msg: "Foto de perfil actualizada exitosamente",
      fotoPerfil: usuarioActualizado.avatar,
    });
  } catch (error) {
    console.error("Error en editarFotoPerfil:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al subir la foto de perfil",
    });
  }
};

// Editar teléfonos
export const editarTelefonos = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { telefonos } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!telefonos || !Array.isArray(telefonos)) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar un array de teléfonos",
      });
    }

    if (telefonos.length === 0 || telefonos.length > 3) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar entre 1 y 3 teléfonos",
      });
    }

    for (let i = 0; i < telefonos.length; i++) {
      const tel = telefonos[i];
      if (!tel.codigoPais || !tel.numero) {
        return res.status(400).json({
          ok: false,
          msg: `El teléfono ${i + 1} debe tener 'codigoPais' y 'numero'`,
        });
      }
    }

    const telefonosConPrincipal = telefonos.map((tel, index) => ({
      codigoPais: tel.codigoPais,
      numero: tel.numero,
      principal: tel.principal !== undefined ? tel.principal : index === 0,
    }));

    await prisma.$transaction(async (tx) => {
      await tx.telefono.deleteMany({
        where: { usuarioId: usuarioId },
      });

      await tx.telefono.createMany({
        data: telefonosConPrincipal.map((tel) => ({
          codigoPais: tel.codigoPais,
          numero: tel.numero,
          principal: tel.principal,
          usuarioId: usuarioId,
        })),
      });
    });

    return res.json({
      ok: true,
      msg: "Teléfonos actualizados exitosamente",
      telefonos: telefonosConPrincipal,
    });
  } catch (error) {
    console.error("Error en editarTelefonos:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar los teléfonos",
    });
  }
};

// Listar mis publicaciones
export const listarMisPublicaciones = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        msg: "No hay token válido",
      });
    }

    // Obtener las publicaciones del usuario
    const publicaciones =
      await publicacionesService.listarMisPublicaciones(usuarioId);

    // Agregar métricas a cada publicación
    const publicacionesConMetricas = await Promise.all(
      publicaciones.map(async (pub: any) => ({
        ...pub,
        metricas: await publicacionesService.obtenerMetricasPorInmueble(pub.inmuebleId)
      }))
    );

    // Obtener estadísticas de publicaciones y suscripción
    const estadisticas =
      await publicacionesService.obtenerEstadisticasPublicaciones(usuarioId);

    return res.json({
      ok: true,
      publicaciones: publicacionesConMetricas,
      estadisticas,
    });
  } catch (error) {
    console.error("Error en listarMisPublicaciones:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener las publicaciones",
    });
  }
};

export const eliminarPublicacion = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    // ✅ CORRECCIÓN: Asegurar que id sea string
    const idStr = Array.isArray(id) ? id[0] : id;
    const publicacionId = parseInt(idStr);

    if (isNaN(publicacionId)) {
      return res.status(400).json({ ok: false, msg: "ID inválido" });
    }

    await publicacionesService.eliminar(publicacionId, usuarioId);

    return res.json({ ok: true, msg: "Publicación eliminada correctamente" });
  } catch (error: any) {
    console.error("Error en eliminarPublicacion:", error);

    if (error.message === "PUBLICACION_NOT_FOUND") {
      return res.status(404).json({ ok: false, msg: "Publicación no encontrada" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res.status(403).json({ ok: false, msg: "No autorizado" });
    }

    return res.status(500).json({ ok: false, msg: "Error al eliminar la publicación" });
  }
};

export const togglePublicacionEstado = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    const { activa } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (typeof activa !== 'boolean') {
      return res.status(400).json({ ok: false, msg: "El campo 'activa' debe ser true o false" });
    }

    // ✅ CORRECCIÓN: Asegurar que id sea string
    const idStr = Array.isArray(id) ? id[0] : id;
    const publicacionId = parseInt(idStr);

    if (isNaN(publicacionId)) {
      return res.status(400).json({ ok: false, msg: "ID inválido" });
    }

    await publicacionesService.cambiarEstado(publicacionId, usuarioId, activa);

    return res.json({
      ok: true,
      msg: `Publicación ${activa ? 'activada' : 'desactivada'} correctamente`,
      activa
    });
  } catch (error: any) {
    console.error("Error en togglePublicacionEstado:", error);

    if (error.message === "PUBLICACION_NOT_FOUND") {
      return res.status(404).json({ ok: false, msg: "Publicación no encontrada" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res.status(403).json({ ok: false, msg: "No autorizado" });
    }

    return res.status(500).json({ ok: false, msg: "Error al cambiar el estado" });
  }
};

export const obtenerPreferenciasNotificacion = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id
    if (!usuarioId) return res.status(401).json({ ok: false, msg: 'No hay token válido' })
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        notificacion_email: true,
        notificacion_whatsapp: true,
        correo: true,
        telefonos: {
          take: 1,
          select: { numero: true, principal: true }
        },
        telefono_telefono_usuario_idTousuario: {
          take: 1,
          select: { numero: true }
        }
      }
    })
    if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })
    return res.json({
      ok: true,
      preferencias: {
        email: usuario.notificacion_email ?? true,
        whatsapp: usuario.notificacion_whatsapp ?? false
      },
      tieneCorreo: !!usuario.correo,
      tieneTelefono: usuario.telefonos.length > 0 || usuario.telefono_telefono_usuario_idTousuario.length > 0
    })
  } catch (error) {
    console.error('Error en obtenerPreferenciasNotificacion:', error)
    return res.status(500).json({ ok: false, msg: 'Error al obtener preferencias' })
  }
}
export const actualizarPreferenciasNotificacion = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id
    if (!usuarioId) return res.status(401).json({ ok: false, msg: 'No hay token válido' })
    const { email, whatsapp } = req.body
    if (typeof email !== 'boolean' || typeof whatsapp !== 'boolean') {
      return res.status(400).json({ ok: false, msg: 'Los valores deben ser booleanos' })
    }
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        notificacion_email: email,
        notificacion_whatsapp: whatsapp
      }
    })
    return res.json({
      ok: true,
      msg: 'Preferencias guardadas correctamente',
      preferencias: { email, whatsapp }
    })
  } catch (error) {
    console.error('Error en actualizarPreferenciasNotificacion:', error)
    return res.status(500).json({ ok: false, msg: 'Error al guardar preferencias' })
  }
}
// Editar fecha de nacimiento
export const editarFechaNacimiento = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { fecha_nacimiento } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    // Validar que se proporcionó la fecha
    if (!fecha_nacimiento) {
      return res.status(400).json({
        ok: false,
        msg: "La fecha de nacimiento es requerida",
      });
    }

    // Validar formato de fecha
    const fechaDate = new Date(fecha_nacimiento);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        ok: false,
        msg: "Formato de fecha inválido. Use formato ISO (YYYY-MM-DD)",
      });
    }

    // Validar que no sea una fecha futura
    const hoy = new Date();
    if (fechaDate > hoy) {
      return res.status(400).json({
        ok: false,
        msg: "La fecha de nacimiento no puede ser futura",
      });
    }

    // Validar edad mínima (18 años) - opcional
    const edadMinima = 18;
    const fechaLimite = new Date();
    fechaLimite.setFullYear(hoy.getFullYear() - edadMinima);

    if (fechaDate > fechaLimite) {
      return res.status(400).json({
        ok: false,
        msg: `Debes tener al menos ${edadMinima} años`,
      });
    }

    // Actualizar la fecha de nacimiento
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        fecha_nacimiento: fechaDate,
        updatedAt: new Date()
      },
    });

    // Formatear fecha para respuesta
    const fechaFormateada = usuarioActualizado.fecha_nacimiento
      ? usuarioActualizado.fecha_nacimiento.toISOString().split('T')[0]
      : null;

    return res.json({
      ok: true,
      msg: "Fecha de nacimiento actualizada exitosamente",
      fecha_nacimiento: fechaFormateada,
    });
  } catch (error) {
    console.error("Error en editarFechaNacimiento:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar la fecha de nacimiento",
    });
  }
};

// Obtener fecha de nacimiento
export const obtenerFechaNacimiento = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fecha_nacimiento: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Calcular edad
    let edad = null;
    if (usuario.fecha_nacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(usuario.fecha_nacimiento);
      edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mesDiff = hoy.getMonth() - nacimiento.getMonth();
      if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
    }

    const fechaFormateada = usuario.fecha_nacimiento
      ? usuario.fecha_nacimiento.toISOString().split('T')[0]
      : null;

    return res.json({
      ok: true,
      data: {
        fecha_nacimiento: fechaFormateada,
        edad: edad,
      },
    });
  } catch (error) {
    console.error("Error en obtenerFechaNacimiento:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener la fecha de nacimiento",
    });
  }
};


