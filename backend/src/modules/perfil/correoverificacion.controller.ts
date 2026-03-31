// TODO: Implementar controlador de verificación de correo
export const verifyEmailController = async () => {
  // Placeholder para futuras implementaciones
}
// correoverificacion.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js'; // ✅ Importar el prisma que ellos ya usan

interface AuthRequest extends Request {
  usuario?: {
    id: number;
  };
}

export const verificarPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { passwordActual } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: 'No hay token válido' });
    }

    if (!passwordActual) {
      return res.status(400).json({ ok: false, msg: 'Password requerido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    const validPassword = passwordActual === usuario.password;

    if (!validPassword) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    return res.json({ ok: true, msg: 'Identidad verificada' });
  } catch (error) {
    console.error('Error en verificarPassword:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al verificar identidad'
    });
  }
};

export const solicitarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { emailNuevo } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: 'No autorizado' });
    }

    if (!emailNuevo) {
      return res.status(400).json({ ok: false, msg: 'Email requerido' });
    }

    const existeEmail = await prisma.usuario.findUnique({
      where: { correo: emailNuevo }
    });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: 'El correo ya está registrado'
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.cambioEmail.create({
      data: {
        token: otp,
        emailNuevo,
        expiraEn,
        usuarioId
      }
    });

    return res.json({
      ok: true,
      msg: 'Código enviado al nuevo correo',
      otp
    });
  } catch (error) {
    console.error('Error en solicitarCambioEmail:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al solicitar cambio'
    });
  }
};

export const confirmarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: 'No autorizado' });
    }

    if (!otp) {
      return res.status(400).json({ ok: false, msg: 'Código requerido' });
    }

    const solicitud = await prisma.cambioEmail.findFirst({
      where: {
        usuarioId,
        completadoEn: null
      },
      orderBy: { creadoEn: 'desc' }
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        msg: 'No hay solicitudes pendientes'
      });
    }

    if (new Date() > solicitud.expiraEn) {
      return res.status(410).json({
        ok: false,
        msg: 'Código expirado'
      });
    }

    if (solicitud.token !== otp) {
      return res.status(400).json({
        ok: false,
        msg: 'Código incorrecto'
      });
    }

    const [usuarioActualizado] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { correo: solicitud.emailNuevo }
      }),
      prisma.cambioEmail.update({
        where: { id: solicitud.id },
        data: { completadoEn: new Date() }
      })
    ]);

    return res.json({
      ok: true,
      msg: 'Correo actualizado exitosamente',
      nuevoCorreo: usuarioActualizado.correo
    });
  } catch (error) {
    console.error('Error en confirmarCambioEmail:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al confirmar cambio'
    });
  }
};
