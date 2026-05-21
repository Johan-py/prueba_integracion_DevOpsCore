// correoverificacion.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.client.js";
import { enviarCodigoCambioEmail, enviarAvisoCambioPassword } from "../../lib/email.service.js";
import { notificarCambioPassword } from "../whatsapp/whatsapp.notifications.js";
import { invalidateOtherUserSessions } from "../auth/auth.repository.js";

interface AuthRequest extends Request {
  usuario?: {
    id: number;
    nombre?: string;
  };
}

const MAX_INTENTOS_CAMBIO_PASSWORD = 5;
const MINUTOS_BLOQUEO_CAMBIO_PASSWORD = 5;

const MAX_CAMBIOS_PASSWORD_EN_VENTANA = 3;
const MINUTOS_VENTANA_CAMBIO_PASSWORD = 5;
const MINUTOS_BLOQUEO_CAMBIOS_FRECUENTES = 10;

const MIN_PASSWORD_LENGTH = 8;

const PASSWORD_SEGURA_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const obtenerBloqueoPorCambiosFrecuentes = async (usuarioId: number) => {
  const ultimosCambios = await prisma.historial_password.findMany({
    where: {
      usuarioId,
    },
    orderBy: {
      creadoEn: "desc",
    },
    take: MAX_CAMBIOS_PASSWORD_EN_VENTANA,
    select: {
      creadoEn: true,
    },
  });

  if (ultimosCambios.length < MAX_CAMBIOS_PASSWORD_EN_VENTANA) {
    return null;
  }

  const fechas = ultimosCambios
    .map((item) => item.creadoEn)
    .filter((fecha): fecha is Date => fecha instanceof Date);

  if (fechas.length < MAX_CAMBIOS_PASSWORD_EN_VENTANA) {
    return null;
  }

  const cambioMasReciente = fechas[0];
  const tercerCambioMasReciente = fechas[MAX_CAMBIOS_PASSWORD_EN_VENTANA - 1];

  const diferenciaEntreCambiosMs =
    cambioMasReciente.getTime() - tercerCambioMasReciente.getTime();

  const ventanaPermitidaMs = MINUTOS_VENTANA_CAMBIO_PASSWORD * 60 * 1000;

  if (diferenciaEntreCambiosMs > ventanaPermitidaMs) {
    return null;
  }

  const bloqueoHasta = new Date(
    cambioMasReciente.getTime() +
      MINUTOS_BLOQUEO_CAMBIOS_FRECUENTES * 60 * 1000
  );

  if (Date.now() >= bloqueoHasta.getTime()) {
    return null;
  }

  return bloqueoHasta;
};

export const cambiarPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    const usuarioId = req.usuario?.id;
    const authHeader = req.headers.authorization;
    const currentToken = authHeader && authHeader.split(" ")[1];

    if (!usuarioId || !currentToken) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    const passwordActualNormalizada =
      typeof passwordActual === "string" ? passwordActual.trim() : "";

    const nuevaPasswordNormalizada =
      typeof nuevaPassword === "string" ? nuevaPassword.trim() : "";

    if (!passwordActualNormalizada || !nuevaPasswordNormalizada) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos son obligatorios",
      });
    }

    if (nuevaPasswordNormalizada.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        ok: false,
        msg: "La nueva contraseña debe tener al menos 8 caracteres",
      });
    }

    if (!PASSWORD_SEGURA_REGEX.test(nuevaPasswordNormalizada)) {
      return res.status(400).json({
        ok: false,
        msg: "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    const ahora = new Date();

    if (
      usuario.bloqueo_cambio_password_hasta &&
      ahora >= usuario.bloqueo_cambio_password_hasta
    ) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentos_fallidos_cambio_password: 0,
          bloqueo_cambio_password_hasta: null,
        },
      });

      usuario.intentos_fallidos_cambio_password = 0;
      usuario.bloqueo_cambio_password_hasta = null;
    }

    if (
      usuario.bloqueo_cambio_password_hasta &&
      ahora < usuario.bloqueo_cambio_password_hasta
    ) {
      return res.status(423).json({
        ok: false,
        bloqueado: true,
        bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
        intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
        msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
      });
    }

    if (
      usuario.intentos_fallidos_cambio_password >=
      MAX_INTENTOS_CAMBIO_PASSWORD
    ) {
      return res.status(423).json({
        ok: false,
        bloqueado: true,
        bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
        intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
        msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
      });
    }

    const passwordIncorrecta = usuario.password !== passwordActualNormalizada;

    if (passwordIncorrecta) {
      const nuevosIntentos = Math.min(
        usuario.intentos_fallidos_cambio_password + 1,
        MAX_INTENTOS_CAMBIO_PASSWORD
      );

      if (nuevosIntentos >= MAX_INTENTOS_CAMBIO_PASSWORD) {
        const bloqueoHasta = new Date(
          Date.now() + MINUTOS_BLOQUEO_CAMBIO_PASSWORD * 60 * 1000
        );

        await prisma.usuario.update({
          where: { id: usuarioId },
          data: {
            intentos_fallidos_cambio_password: MAX_INTENTOS_CAMBIO_PASSWORD,
            bloqueo_cambio_password_hasta: bloqueoHasta,
          },
        });

        return res.status(423).json({
          ok: false,
          bloqueado: true,
          bloqueoHasta,
          intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
          msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
        });
      }

      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentos_fallidos_cambio_password: nuevosIntentos,
          bloqueo_cambio_password_hasta: null,
        },
      });

      return res.status(401).json({
        ok: false,
        bloqueado: false,
        intentosFallidos: nuevosIntentos,
        intentosRestantes: MAX_INTENTOS_CAMBIO_PASSWORD - nuevosIntentos,
        msg: `La contraseña actual es incorrecta. Intento ${nuevosIntentos} de ${MAX_INTENTOS_CAMBIO_PASSWORD}.`,
      });
    }

    if (usuario.password === nuevaPasswordNormalizada) {
      return res.status(400).json({
        ok: false,
        msg: "La nueva contraseña no puede ser igual a la actual",
      });
    }

    const historialReciente = await prisma.historial_password.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: "desc" },
      take: 3,
      select: { passwordHash: true },
    });

    const esPasswordReciente = historialReciente.some(
      (h) => h.passwordHash === nuevaPasswordNormalizada
    );

    if (esPasswordReciente) {
      return res.status(400).json({
        ok: false,
        msg: "No puedes usar ninguna de tus últimas 3 contraseñas.",
      });
    }

    const bloqueoPorCambiosFrecuentes = await obtenerBloqueoPorCambiosFrecuentes(usuarioId);
      await obtenerBloqueoPorCambiosFrecuentes(usuarioId);

    if (bloqueoPorCambiosFrecuentes) {
      return res.status(429).json({
        ok: false,
        bloqueado: true,
        bloqueoHasta: bloqueoPorCambiosFrecuentes,
        msg: "Has superado el límite de cambios de contraseña. Intenta nuevamente en 10 minutos.",
      });
    }

    const cambioRealizado = await prisma.$transaction(async (tx) => {
    const resultadoActualizacion = await tx.usuario.updateMany({
      where: {
        id: usuarioId,
        password: passwordActualNormalizada,
      },
      data: {
        password: nuevaPasswordNormalizada,
        intentos_fallidos_cambio_password: 0,
        bloqueo_cambio_password_hasta: null,
        password_actualizado_en: new Date(),
      },
    });

    if (resultadoActualizacion.count !== 1) {
      return false;
    }

    await tx.historial_password.create({
      data: {
        usuarioId,
        passwordHash: passwordActualNormalizada,
      },
    });

    return true;
  });

  if (!cambioRealizado) {
    return res.status(409).json({
      ok: false,
      msg: "La contraseña ya fue modificada en otra ventana. Actualiza la página e intenta nuevamente.",
    });
  }

    await invalidateOtherUserSessions(usuarioId, currentToken);

    enviarAvisoCambioPassword({
      emailDestino: usuario.correo,
      nombreUsuario: usuario.nombre,
    }).catch((err) => console.error("Error enviando email de aviso cambio password:", err));

    notificarCambioPassword(usuarioId).catch((err) =>
      console.error("Error enviando WhatsApp de aviso cambio password:", err)
    );

    return res.json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error en cambiarPassword:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al actualizar la contraseña",
    });
  }
};

export const verificarPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { passwordActual } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    const passwordActualNormalizada =
      typeof passwordActual === "string" ? passwordActual.trim() : "";

    if (!passwordActualNormalizada) {
      return res.status(400).json({ ok: false, msg: "Password requerido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    const ahora = new Date();

    if (
      usuario.bloqueo_cambio_password_hasta &&
      ahora >= usuario.bloqueo_cambio_password_hasta
    ) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentos_fallidos_cambio_password: 0,
          bloqueo_cambio_password_hasta: null,
        },
      });

      usuario.intentos_fallidos_cambio_password = 0;
      usuario.bloqueo_cambio_password_hasta = null;
    }

    if (
      usuario.bloqueo_cambio_password_hasta &&
      ahora < usuario.bloqueo_cambio_password_hasta
    ) {
      return res.status(423).json({
        ok: false,
        bloqueado: true,
        bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
        intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
        msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
      });
    }

    if (
      usuario.intentos_fallidos_cambio_password >=
      MAX_INTENTOS_CAMBIO_PASSWORD
    ) {
      return res.status(423).json({
        ok: false,
        bloqueado: true,
        bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
        intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
        msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
      });
    }

    const validPassword = passwordActualNormalizada === usuario.password;

    if (!validPassword) {
      const nuevosIntentos = Math.min(
        usuario.intentos_fallidos_cambio_password + 1,
        MAX_INTENTOS_CAMBIO_PASSWORD
      );

      if (nuevosIntentos >= MAX_INTENTOS_CAMBIO_PASSWORD) {
        const bloqueoHasta = new Date(
          Date.now() + MINUTOS_BLOQUEO_CAMBIO_PASSWORD * 60 * 1000
        );

        await prisma.usuario.update({
          where: { id: usuarioId },
          data: {
            intentos_fallidos_cambio_password: MAX_INTENTOS_CAMBIO_PASSWORD,
            bloqueo_cambio_password_hasta: bloqueoHasta,
          },
        });

        return res.status(423).json({
          ok: false,
          bloqueado: true,
          bloqueoHasta,
          intentosFallidos: MAX_INTENTOS_CAMBIO_PASSWORD,
          msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
        });
      }

      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentos_fallidos_cambio_password: nuevosIntentos,
          bloqueo_cambio_password_hasta: null,
        },
      });

      return res.status(401).json({
        ok: false,
        bloqueado: false,
        intentosFallidos: nuevosIntentos,
        intentosRestantes: MAX_INTENTOS_CAMBIO_PASSWORD - nuevosIntentos,
        msg: `Contraseña incorrecta. Intento ${nuevosIntentos} de ${MAX_INTENTOS_CAMBIO_PASSWORD}.`,
      });
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        intentos_fallidos_cambio_password: 0,
        bloqueo_cambio_password_hasta: null,
      },
    });

    return res.json({ ok: true, msg: "Identidad verificada" });
  } catch (error) {
    console.error("Error en verificarPassword:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al verificar identidad",
    });
  }
};

export const solicitarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { emailNuevo } = req.body;
    const usuarioId = req.usuario?.id;
    const nombreUsuario = req.usuario?.nombre;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    if (!emailNuevo) {
      return res.status(400).json({ ok: false, msg: "Email requerido" });
    }

    const existeEmail = await prisma.usuario.findUnique({
      where: { correo: emailNuevo },
    });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya está registrado",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.cambioEmail.create({
      data: {
        token: otp,
        email_nuevo: emailNuevo,
        expira_en: expiraEn,
        usuario_id: usuarioId,
      },
    });

    const emailEnviado = await enviarCodigoCambioEmail({
      emailDestino: emailNuevo,
      codigo: otp,
      nombreUsuario,
    });

    if (!emailEnviado.success) {
      console.error(
        `❌ Error al enviar email a ${emailNuevo}, pero el OTP fue guardado`
      );
    }

    return res.json({
      ok: true,
      msg: "Código enviado al nuevo correo",
    });
  } catch (error) {
    console.error("Error en solicitarCambioEmail:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al solicitar cambio",
    });
  }
};

export const confirmarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    if (!otp) {
      return res.status(400).json({ ok: false, msg: "Código requerido" });
    }

    const solicitud = await prisma.cambioEmail.findFirst({
      where: {
        usuario_id: usuarioId,
        completado_en: null,
      },
      orderBy: { creado_en: "desc" },
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        msg: "No hay solicitudes pendientes",
      });
    }

    if (new Date() > solicitud.expira_en) {
      return res.status(410).json({
        ok: false,
        msg: "Código expirado. Solicita un nuevo código",
      });
    }

    if (solicitud.token !== otp) {
      return res.status(400).json({
        ok: false,
        msg: "Código incorrecto",
      });
    }

    const [usuarioActualizado] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { correo: solicitud.email_nuevo },
      }),
      prisma.cambioEmail.update({
        where: { id: solicitud.id },
        data: { completado_en: new Date() },
      }),
    ]);

    return res.json({
      ok: true,
      msg: "Correo actualizado exitosamente",
      nuevoCorreo: usuarioActualizado.correo,
    });
  } catch (error) {
    console.error("Error en confirmarCambioEmail:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al confirmar cambio",
    });
  }
};