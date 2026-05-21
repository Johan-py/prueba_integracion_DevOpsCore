import PDFDocument from "pdfkit";
import { env } from "../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface EnviarCodigoParams {
  emailDestino: string;
  codigo: string;
  nombreUsuario?: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

interface BrevoAttachment {
  content: string; // base64
  name: string;
}

const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
  bcc,
  attachment,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  bcc?: string;
  attachment?: BrevoAttachment;
}): Promise<EmailSendResult> => {
  try {
    const payload: Record<string, unknown> = {
      sender: { name: "PropBol", email: env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    };

    if (bcc) payload.bcc = [{ email: bcc }];
    if (attachment) payload.attachment = [attachment];

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.EMAIL_PASSWORD,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error al enviar email:", errorData);
      return { success: false, error: errorData };
    }

    const data = (await response.json()) as { messageId?: string };
    console.log(`✅ Email enviado a ${to} - ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    return { success: false, error };
  }
};

const enviarConReintentos = async (
  fn: () => Promise<EmailSendResult>,
  intentos = 3,
): Promise<EmailSendResult> => {
  for (let i = 0; i < intentos; i++) {
    const resultado = await fn();
    if (resultado.success) return resultado;
    if (i < intentos - 1)
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  return { success: false, error: `Falló tras ${intentos} intentos` };
};

const generarPDFComprobante = ({
  idTransaccion,
  nombreUsuario,
  nombrePlan,
  monto,
  fechaHora,
  tipoFacturacion = "mensual",
}: {
  idTransaccion: number;
  nombreUsuario: string;
  nombrePlan: string;
  monto: number;
  fechaHora: Date;
  tipoFacturacion?: string;
}): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("PropBol — Comprobante de Pago", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`N° de transacción: ${idTransaccion}`);
    doc.text(`Titular: ${nombreUsuario}`);
    doc.text(`Plan: ${nombrePlan}`);
    doc.text(
      `Tipo de facturación: ${tipoFacturacion === "anual" ? "Anual" : "Mensual"}`,
    );
    doc.text(`Monto: Bs. ${monto.toFixed(2)}`);
    doc.text(
      `Fecha y hora: ${fechaHora.toLocaleString("es-BO", { timeZone: "America/La_Paz" })}`,
    );
    doc.text(`Moneda: BOB / Bolivianos`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Este comprobante es válido como constancia de pago.", {
        align: "center",
      });

    doc.end();
  });
};

export const enviarComprobantePago = async ({
  emailUsuario,
  nombreUsuario,
  idTransaccion,
  nombrePlan,
  monto,
  fechaHora,
  tipoFacturacion = "mensual",
}: {
  emailUsuario: string;
  nombreUsuario: string;
  idTransaccion: number;
  nombrePlan: string;
  monto: number;
  fechaHora: Date;
  tipoFacturacion?: string;
}): Promise<EmailSendResult> => {
  const pdfBuffer = await generarPDFComprobante({
    idTransaccion,
    nombreUsuario,
    nombrePlan,
    monto,
    fechaHora,
    tipoFacturacion,
  });
  const pdfBase64 = pdfBuffer.toString("base64");

  const fechaStr = fechaHora.toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
  });

  return enviarConReintentos(() =>
    sendBrevoEmail({
      to: emailUsuario,
      bcc: env.ADMIN_EMAIL,
      subject: `Comprobante de pago #${idTransaccion} — PropBol`,
      htmlContent: `
        <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
            <div style="background:#d97706;padding:20px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Comprobante de Pago</h1>
            </div>
            <div style="padding:30px;">
              <p style="font-size:16px;color:#333;">Hola ${nombreUsuario},</p>
              <p style="font-size:16px;color:#333;">Tu pago ha sido procesado exitosamente. Aquí está tu comprobante:</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr style="background:#fef3c7;">
                  <td style="padding:10px;border:1px solid #fde68a;font-weight:bold;color:#78350f;">N° Transacción</td>
                  <td style="padding:10px;border:1px solid #fde68a;color:#333;">#${idTransaccion}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#374151;">Plan</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;color:#333;">${nombrePlan}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#374151;">Facturación</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;color:#333;">${tipoFacturacion === "anual" ? "Anual" : "Mensual"}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#374151;">Monto</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;color:#333;">Bs. ${monto.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#374151;">Fecha y hora</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;color:#333;">${fechaStr}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#374151;">Moneda</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;color:#333;">BOB / Bolivianos</td>
                </tr>
              </table>
              <p style="font-size:14px;color:#666;">El comprobante en PDF está adjunto a este correo.</p>
            </div>
            <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 PropBol Inmobiliaria · Todos los derechos reservados</p>
            </div>
          </div>
        </body></html>
      `,
      textContent: `Hola ${nombreUsuario},\n\nTu pago ha sido procesado.\n\nN° Transacción: #${idTransaccion}\nPlan: ${nombrePlan}\nFacturación: ${tipoFacturacion === "anual" ? "Anual" : "Mensual"}\nMonto: Bs. ${monto.toFixed(2)}\nFecha: ${fechaStr}\nMoneda: BOB / Bolivianos\n\nEl comprobante PDF está adjunto.`,
      attachment: {
        content: pdfBase64,
        name: `comprobante-${idTransaccion}.pdf`,
      },
    }),
  );
};

export const verifyEmailTransport = async (): Promise<void> => {
  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    throw new Error("Credenciales de email no configuradas");
  }
  console.log("✅ Servicio de email listo (Brevo API)");
};

export const enviarCodigoCambioEmail = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Cambio de email",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verificación de Email</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Has solicitado cambiar el email de tu cuenta. Ingresa el siguiente código:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no solicitaste este cambio, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nExpira en 5 minutos.`,
  });
};

export const enviarCodigoRegistro = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Registro PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verifica tu cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Usa este código para completar tu registro en PropBol:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nExpira en 5 minutos.`,
  });
};

export const enviarCorreoRecuperacionPassword = async ({
  emailDestino,
  nombreUsuario,
  resetLink,
  minutosExpiracion,
}: {
  emailDestino: string;
  nombreUsuario?: string;
  resetLink: string;
  minutosExpiracion: number;
}): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Restablece tu contraseña - PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Restablecer contraseña</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <div style="text-align:center;margin:25px 0;">
              <a href="${resetLink}" style="background-color:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-size:16px;font-weight:bold;">
                Cambiar mi contraseña
              </a>
            </div>
            <p style="font-size:14px;color:#666;">Este enlace estará disponible durante <strong style="color:#d97706;">${minutosExpiracion} minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 PropBol Inmobiliaria · Todos los derechos reservados</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nRestablece tu contraseña desde este enlace: ${resetLink}\n\nExpira en ${minutosExpiracion} minutos.`,
  });
};

export const enviarCodigo2FA = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Inicio de sesión PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verifica tu cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Ingresa el siguiente código para completar tu inicio de sesión:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no intentaste iniciar sesión, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Este es un mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nEste código expirará en 5 minutos.`,
  });
};

export const enviarCodigoDesactivacionCuenta = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Desactivación de cuenta PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#dc2626;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Desactivación de cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Ingresa el siguiente código para confirmar la desactivación de tu cuenta:</p>
            <div style="background:#fee2e2;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fecaca;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#b91c1c;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#dc2626;">5 minutos</strong>.</p>
            <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#7f1d1d;">Si no solicitaste esta acción, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Este es un mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación para desactivar la cuenta es: ${codigo}\n\nEste código expirará en 5 minutos.`,
  });
};

export const enviarCodigoActivacionCuenta = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Activación de cuenta PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#ea580c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Activación de cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Ingresa el siguiente código para completar la activación de tu cuenta:</p>
            <div style="background:#fff7ed;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #ffedd5;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#9a3412;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#ea580c;">1 minuto</strong>.</p>
            <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#7c2d12;">Si no solicitaste esta acción, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Este es un mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación para activar la cuenta es: ${codigo}\n\nEste código expirará en 1 minuto.`,
  });
};

export const enviarAvisoCambioPassword = async ({
  emailDestino,
  nombreUsuario,
}: {
  emailDestino: string;
  nombreUsuario?: string;
}): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Tu contraseña ha sido cambiada - PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Seguridad de tu cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Te informamos que la contraseña de tu cuenta en PropBol ha sido actualizada correctamente.</p>
            <div style="background:#f9fafb;border-left:4px solid #d97706;padding:15px;margin:20px 0;">
              <p style="margin:0;font-size:14px;color:#374151;">
                Si tú realizaste este cambio, no necesitas realizar ninguna acción adicional.
              </p>
            </div>
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;">
              <p style="margin:0;font-size:14px;color:#78350f;">
                <strong>¿No fuiste tú?</strong> Si no realizaste este cambio, por favor ponte en contacto con nuestro equipo de soporte de inmediato o intenta restablecer tu contraseña desde la página de inicio de sesión.
              </p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 PropBol Inmobiliaria · Todos los derechos reservados</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTe informamos que la contraseña de tu cuenta en PropBol ha sido actualizada correctamente.\n\nSi no realizaste este cambio, por favor contacta a soporte de inmediato.`,
  });
};

export const enviarCorreoBienvenidaLinkedIn = async ({
  emailDestino,
  nombreUsuario,
}: {
  emailDestino: string;
  nombreUsuario?: string;
}): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Bienvenido a PropBol",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"/></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
            <div style="background:#d97706;padding:20px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Bienvenido a PropBol</h1>
            </div>

            <div style="padding:30px;">
              <p style="font-size:16px;color:#333;">${saludo}</p>
              <p style="font-size:16px;color:#333;">
                Tu cuenta fue creada exitosamente mediante LinkedIn.
              </p>
              <p style="font-size:16px;color:#333;">
                Ya puedes iniciar sesión y acceder a las funcionalidades de PropBol.
              </p>

              <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#78350f;">
                  Si no realizaste este registro, por favor ignora este mensaje o contacta con soporte.
                </p>
              </div>
            </div>

            <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">
                © 2026 PropBol Inmobiliaria · Todos los derechos reservados
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `${saludo}

Tu cuenta fue creada exitosamente mediante LinkedIn.

Ya puedes iniciar sesión y acceder a PropBol.

Si no realizaste este registro, ignora este mensaje o contacta con soporte.`,
  });
};

export const enviarCodigoActivacion2FA = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject:
      "Código de verificación - Activar verificación en dos pasos PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verificación en dos pasos</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Ingresa el siguiente código para activar la verificación en dos pasos en tu cuenta:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no solicitaste esta acción, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Este es un mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código para activar la verificación en dos pasos es: ${codigo}\n\nEste código expirará en 5 minutos.`,
  });
};
