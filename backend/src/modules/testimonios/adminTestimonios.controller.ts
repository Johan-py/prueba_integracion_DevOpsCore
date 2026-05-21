import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.client.js";

export const getAdminTestimonios = async (req: Request, res: Response) => {
  try {
    const data: any[] = await prisma.$queryRaw`
      SELECT 
        t.*, 
        u.nombre as u_nombre, 
        u.apellido as u_apellido,
        COUNT(tl.id)::int as total_likes
      FROM "testimonio" t
      LEFT JOIN "usuario" u ON t.usuario_id = u.id
      LEFT JOIN "testimonio_like" tl ON t.id = tl.testimonio_id
      WHERE t."eliminado" = false 
      GROUP BY t.id, u.id, u.nombre, u.apellido
      ORDER BY t."fecha_creacion" DESC
    `;

    const testimonios = data.map((t) => {
      let nombreAMostrar = t.usuario_id;
      if (t.u_nombre) {
        nombreAMostrar = `${t.u_nombre} ${t.u_apellido || ""}`.trim();
      }

      return {
        id: t.id,
        nombreTestimonial: String(nombreAMostrar || "Anónimo"),
        creadoPor: t.u_nombre ? "Usuario" : "Admin",
        departamento: t.ciudad || "No especificado",
        zonaBarrio: t.zona || "",
        categoria: t.categoria || "General",
        texto: t.comentario,
        avatar: null,
        likes: t.total_likes || 0,
        activo: t.visible,
        calificacion: t.calificacion || 5,
      };
    });

    res.json(testimonios);
  } catch (error: any) {
    console.error("Error al obtener testimonios:", error);
    res.status(500).json({
      message: "Error al obtener testimonios",
      details: error.message,
    });
  }
};

export const createAdminTestimonio = async (req: Request, res: Response) => {
  try {
    const {
      comentario,
      ciudad,
      zona,
      categoria,
      visible,
      nombreAutor,
      apellidoAutor,
      calificacion,
    } = req.body as {
      comentario?: string;
      ciudad?: string;
      zona?: string;
      categoria?: string;
      visible?: boolean;
      nombreAutor?: string;
      apellidoAutor?: string;
      calificacion?: number;
    };

    const nombreLimpio = nombreAutor?.trim() || "Anónimo";
    const apellidoLimpio = apellidoAutor?.trim() || "";

    if (!comentario?.trim()) {
      return res.status(400).json({ message: "El comentario es obligatorio" });
    }

    if (!ciudad?.trim()) {
      return res
        .status(400)
        .json({ message: "El departamento es obligatorio" });
    }

    if (!categoria?.trim()) {
      return res.status(400).json({ message: "La categoría es obligatoria" });
    }

    // 1. Crear el "Usuario Fantasma"
    const rolVisitante = await prisma.rol.findFirst({
      where: { nombre: "VISITANTE" },
    });

    const phantomUser = await prisma.usuario.create({
      data: {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        correo: `fantasma_${Date.now()}_${Math.floor(Math.random() * 1000)}@propbol.com`,
        password: "phantom_password_no_login",
        rolId: rolVisitante?.id || null,
        activo: true,
      },
    });

    // 2. Crear el testimonio
    const result: any[] = await prisma.$queryRaw`
      INSERT INTO "testimonio" ("comentario", "ciudad", "zona", "categoria", "visible", "eliminado", "usuario_id", "calificacion", "fecha_creacion")
      VALUES (
        ${comentario.trim()}, 
        ${ciudad.trim()}, 
        ${zona?.trim() || null}, 
        ${categoria.trim()}, 
        ${visible ?? true}, 
        ${false}, 
        ${phantomUser.id}, 
        ${calificacion ? Number(calificacion) : 5},
        NOW()
      )
      RETURNING *
    `;

    if (!result || result.length === 0) {
      throw new Error("No se pudo obtener el testimonio creado");
    }

    const nuevoTestimonio = result[0];

    res.status(201).json({
      id: nuevoTestimonio.id,
      nombreTestimonial: `${nombreLimpio} ${apellidoLimpio}`.trim(),
      creadoPor: "Admin",
      departamento: nuevoTestimonio.ciudad || "No especificado",
      zonaBarrio: nuevoTestimonio.zona || "",
      categoria: nuevoTestimonio.categoria || "General",
      texto: nuevoTestimonio.comentario,
      avatar: null,
      likes: 0,
      activo: nuevoTestimonio.visible ?? true,
      calificacion: nuevoTestimonio.calificacion || 5,
    });
  } catch (error: any) {
    console.error("Error al crear testimonio:", error);
    res.status(500).json({
      message: "Error al crear el testimonio",
      details: error.message,
    });
  }
};

export const updateAdminTestimonio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      comentario,
      ciudad,
      zona,
      categoria,
      visible,
      nombreAutor,
      apellidoAutor,
      calificacion,
    } = req.body as {
      comentario?: string;
      ciudad?: string;
      zona?: string;
      categoria?: string;
      visible?: boolean;
      nombreAutor?: string;
      apellidoAutor?: string;
      calificacion?: number;
    };

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID de testimonio inválido" });
    }

    const rows: any[] = await prisma.$queryRaw`
      SELECT * FROM "testimonio" WHERE "id" = ${Number(id)}
    `;
    const testimonio = rows[0];

    if (!testimonio) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    let uId = Number(testimonio.usuario_id);
    const nombreLimpio = nombreAutor?.trim();
    const apellidoLimpio = apellidoAutor?.trim();

    if (isNaN(uId)) {
      const rolVisitante = await prisma.rol.findFirst({
        where: { nombre: "VISITANTE" },
      });
      const phantomUser = await prisma.usuario.create({
        data: {
          nombre: nombreLimpio || "Anónimo",
          apellido: apellidoLimpio || "",
          correo: `fantasma_fix_${Date.now()}@propbol.com`,
          password: "phantom_password_fix",
          rolId: rolVisitante?.id || null,
          activo: true,
        },
      });
      uId = phantomUser.id;
    } else {
      const updateData: any = {};
      if (nombreLimpio !== undefined) updateData.nombre = nombreLimpio;
      if (apellidoLimpio !== undefined) updateData.apellido = apellidoLimpio;

      if (Object.keys(updateData).length > 0) {
        await prisma.usuario
          .update({
            where: { id: uId },
            data: updateData,
          })
          .catch((err) => console.error("Error al actualizar usuario:", err));
      }
    }

    const updateResult: any[] = await prisma.$queryRaw`
      UPDATE "testimonio" 
      SET 
        "comentario" = ${comentario?.trim() || testimonio.comentario},
        "ciudad" = ${ciudad?.trim() || testimonio.ciudad},
        "zona" = ${zona?.trim() || testimonio.zona},
        "categoria" = ${categoria?.trim() || testimonio.categoria},
        "visible" = ${visible ?? testimonio.visible},
        "calificacion" = ${calificacion ? Number(calificacion) : testimonio.calificacion || 5},
        "usuario_id" = ${uId}
      WHERE "id" = ${Number(id)}
      RETURNING *
    `;

    const actualizado = updateResult[0];
    const finalUser = await prisma.usuario.findUnique({ where: { id: uId } });

    res.json({
      id: actualizado.id,
      nombreTestimonial:
        `${finalUser?.nombre || ""} ${finalUser?.apellido || ""}`.trim() ||
        "Usuario",
      creadoPor: "Admin",
      departamento: actualizado.ciudad || "No especificado",
      zonaBarrio: actualizado.zona || "",
      categoria: actualizado.categoria || "General",
      texto: actualizado.comentario,
      avatar: null,
      likes: 0,
      activo: actualizado.visible ?? true,
      calificacion: actualizado.calificacion || 5,
    });
  } catch (error: any) {
    console.error("Error al actualizar testimonio:", error);
    res.status(500).json({
      message: "Error al actualizar el testimonio",
      details: error.message,
    });
  }
};

export const deleteAdminTestimonio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID de testimonio inválido" });
    }

    const rows: any[] = await prisma.$queryRaw`
      SELECT * FROM "testimonio" WHERE "id" = ${Number(id)}
    `;
    const testimonio = rows[0];

    if (!testimonio) {
      return res.status(404).json({ message: "Testimonio no encontrado" });
    }

    await prisma.$executeRaw`
      UPDATE "testimonio" SET "eliminado" = true WHERE "id" = ${Number(id)}
    `;

    res.json({ message: "Testimonio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar testimonio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
