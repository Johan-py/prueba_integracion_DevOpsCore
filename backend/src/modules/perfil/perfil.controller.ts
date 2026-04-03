import { Request, Response } from 'express'
import { prisma } from "../../db";

interface AuthRequest extends Request {
  usuario?: {
    id: number
    nombre?: string
    rol?: string
  }
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
      include: {
        telefonos: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Extraer los teléfonos (máximo 3)
    const telefonos = usuario.telefonos.slice(0, 3).map(tel => ({
      codigoPais: tel.codigoPais,
      numero: tel.numero,
      principal: tel.principal
    }));

    return res.json({
      ok: true,
      perfil: {
        nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
        correo: usuario.correo,
        telefonos: telefonos,
        pais: usuario.pais || null,
        genero: usuario.genero || null,
        direccion: usuario.direccion || null,
        fotoPerfil: usuario.avatar || null
      }
    });
  } catch (error) {
    console.error("Error en obtenerPerfil:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener el perfil del usuario",
    });
  }
};

// Editar nombre
export const editarNombre = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { nombre, apellido } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!nombre && !apellido) {
      return res.status(400).json({ ok: false, msg: "Debe proporcionar nombre o apellido" });
    }

    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: updateData
    });

    return res.json({
      ok: true,
      msg: "Nombre actualizado exitosamente",
      nombreCompleto: `${usuarioActualizado.nombre} ${usuarioActualizado.apellido}`
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

    if (pais === undefined) {
      return res.status(400).json({ ok: false, msg: "El país es requerido" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { pais }
    });

    return res.json({
      ok: true,
      msg: "País actualizado exitosamente",
      pais: usuarioActualizado.pais
    });
  } catch (error) {
    console.error("Error en editarPais:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar el país",
    });
  }
};

// Editar género
export const editarGenero = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { genero } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!genero) {
      return res.status(400).json({ ok: false, msg: "El género es requerido" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { genero }
    });

    return res.json({
      ok: true,
      msg: "Género actualizado exitosamente",
      genero: usuarioActualizado.genero
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

    if (direccion === undefined) {
      return res.status(400).json({ ok: false, msg: "La dirección es requerida" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { direccion }
    });

    return res.json({
      ok: true,
      msg: "Dirección actualizada exitosamente",
      direccion: usuarioActualizado.direccion
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
    const { fotoPerfil } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!fotoPerfil) {
      return res.status(400).json({ ok: false, msg: "La URL de la foto es requerida" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatar: fotoPerfil }
    });

    return res.json({
      ok: true,
      msg: "Foto de perfil actualizada exitosamente",
      fotoPerfil: usuarioActualizado.avatar
    });
  } catch (error) {
    console.error("Error en editarFotoPerfil:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar la foto de perfil",
    });
  }
};

// Editar teléfonos (actualiza todos los teléfonos de una vez)
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
        msg: "Debe proporcionar un array de teléfonos"
      });
    }

    if (telefonos.length === 0 || telefonos.length > 3) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar entre 1 y 3 teléfonos"
      });
    }

    // Validar que cada teléfono tenga codigoPais y numero
    for (let i = 0; i < telefonos.length; i++) {
      const tel = telefonos[i];
      if (!tel.codigoPais || !tel.numero) {
        return res.status(400).json({
          ok: false,
          msg: `El teléfono ${i + 1} debe tener 'codigoPais' y 'numero'`
        });
      }
    }

    // Determinar cuál es el teléfono principal (el primero si no se especifica)
    const telefonosConPrincipal = telefonos.map((tel, index) => ({
      codigoPais: tel.codigoPais,
      numero: tel.numero,
      principal: tel.principal !== undefined ? tel.principal : index === 0 // El primero es principal por defecto
    }));

    // Actualizar teléfonos en transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar teléfonos existentes
      await tx.telefono.deleteMany({
        where: { usuarioId: usuarioId }
      });

      // Crear nuevos teléfonos
      await tx.telefono.createMany({
        data: telefonosConPrincipal.map(tel => ({
          codigoPais: tel.codigoPais,
          numero: tel.numero,
          principal: tel.principal,
          usuarioId: usuarioId
        }))
      });
    });

    return res.json({
      ok: true,
      msg: "Teléfonos actualizados exitosamente",
      telefonos: telefonosConPrincipal
    });
  } catch (error) {
    console.error("Error en editarTelefonos:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al editar los teléfonos",
    });
  }
};