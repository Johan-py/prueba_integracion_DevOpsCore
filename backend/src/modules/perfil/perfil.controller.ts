import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.config.js'

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
