import { prisma } from "../../lib/prisma.client.js";
import { enviarMensajeWhatsapp, formatearTelefono } from "./whatsapp.service.js";

interface NotificacionWhatsappResult {
  success: boolean;
  omitido?: boolean;   // true si el usuario no tiene WhatsApp activado
  error?: unknown;
}

/**
 * Obtiene el teléfono principal del usuario y verifica
 * si tiene activadas las notificaciones por WhatsApp.
 */
const obtenerDatosWhatsapp = async (usuarioId: number) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      nombre: true,
      notificacion_whatsapp: true,
      telefonos: {
        where: { principal: true },
        take: 1,
      },
    },
  });

  if (!usuario) return null;
  if (!usuario.notificacion_whatsapp) return null;  // No quiere notificaciones WA
  if (usuario.telefonos.length === 0) return null;  // No tiene teléfono registrado

  const tel = usuario.telefonos[0];
  const telefono = formatearTelefono(tel.codigoPais, tel.numero);

  return { nombre: usuario.nombre, telefono };
};

// ─── Notificación de bienvenida tras registro ──────────────────────────────
export const notificarRegistroExitoso = async (
  usuarioId: number
): Promise<NotificacionWhatsappResult> => {
  const datos = await obtenerDatosWhatsapp(usuarioId);
  if (!datos) return { success: false, omitido: true };

  const mensaje =
    `¡Bienvenido a *PropBol*, ${datos.nombre}! 🏠\n\n` +
    `Tu cuenta fue creada exitosamente.\n` +
    `Ya podés explorar propiedades o publicar la tuya.\n\n` +
    `_PropBol - Tu plataforma inmobiliaria en Bolivia_`;

  return enviarMensajeWhatsapp({ telefono: datos.telefono, mensaje });
};

// ─── Notificación cuando se publica un inmueble ────────────────────────────
export const notificarNuevaPublicacion = async (
  usuarioId: number,
  tituloInmueble: string
): Promise<NotificacionWhatsappResult> => {
  const datos = await obtenerDatosWhatsapp(usuarioId);
  if (!datos) return { success: false, omitido: true };

  const mensaje =
    `¡Hola ${datos.nombre}! 🎉\n\n` +
    `Tu publicación *"${tituloInmueble}"* ya está activa en PropBol.\n` +
    `Los interesados podrán verla desde ahora.\n\n` +
    `_PropBol - Tu plataforma inmobiliaria en Bolivia_`;

  return enviarMensajeWhatsapp({ telefono: datos.telefono, mensaje });
};

// ─── Notificación de pago/suscripción confirmado ───────────────────────────
export const notificarPagoConfirmado = async (
  usuarioId: number,
  nombrePlan: string
): Promise<NotificacionWhatsappResult> => {
  const datos = await obtenerDatosWhatsapp(usuarioId);
  if (!datos) return { success: false, omitido: true };

  const mensaje =
    `¡Hola ${datos.nombre}! ✅\n\n` +
    `Tu pago fue verificado correctamente.\n` +
    `*Plan activado:* ${nombrePlan}\n\n` +
    `Ya podés disfrutar de todos los beneficios de tu suscripción.\n\n` +
    `_PropBol - Tu plataforma inmobiliaria en Bolivia_`;

  return enviarMensajeWhatsapp({ telefono: datos.telefono, mensaje });
};

export const notificarCambioPassword = async (
  usuarioId: number
): Promise<NotificacionWhatsappResult> => {
  const datos = await obtenerDatosWhatsapp(usuarioId);
  if (!datos) return { success: false, omitido: true };

  const mensaje =
    `⚠️ *Seguridad: Cambio de contraseña*\n\n` +
    `Hola ${datos.nombre}, te informamos que la contraseña de tu cuenta en *PropBol* ha sido actualizada.\n\n` +
    `Si no realizaste este cambio, por favor contactate con soporte de inmediato.\n\n` +
    `_PropBol - Tu plataforma inmobiliaria en Bolivia_`;

  return enviarMensajeWhatsapp({ telefono: datos.telefono, mensaje });
};

// ─── Notificación genérica (para cualquier otro evento) ───────────────────
export const notificarMensajeGenerico = async (
  usuarioId: number,
  titulo: string,
  cuerpo: string
): Promise<NotificacionWhatsappResult> => {
  const datos = await obtenerDatosWhatsapp(usuarioId);
  if (!datos) return { success: false, omitido: true };

  const mensaje =
    `*${titulo}*\n\n` +
    `${cuerpo}\n\n` +
    `_PropBol - Tu plataforma inmobiliaria en Bolivia_`;

  return enviarMensajeWhatsapp({ telefono: datos.telefono, mensaje });
};