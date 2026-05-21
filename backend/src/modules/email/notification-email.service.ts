import { env } from "../../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface EnviarCodigoParams {
  emailDestino: string;
  codigo: string;
  nombreUsuario?: string;
}

interface SendNotificationEmailParams {
  emailDestino: string;
  asunto: string;
  mensajeHtml: string;
  mensajeTexto: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}): Promise<EmailSendResult> => {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.EMAIL_PASSWORD,
      },
      body: JSON.stringify({
        sender: { name: "PropBol", email: env.EMAIL_USER },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent,
      }),
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

export const verifyEmailTransport = async (): Promise<void> => {
  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    throw new Error("Credenciales de email no configuradas");
  }

  console.log("✅ Servicio de email listo (Brevo API)");
};

export const sendNotificationEmail = async ({
  emailDestino,
  asunto,
  mensajeHtml,
  mensajeTexto,
}: SendNotificationEmailParams): Promise<EmailSendResult> => {
  return sendBrevoEmail({
    to: emailDestino,
    subject: asunto,
    htmlContent: mensajeHtml,
    textContent: mensajeTexto,
  });
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden;">
            <div style="background: #d97706; padding: 20px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Verificación de Email</h1>
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">${saludo}</p>
              <p style="font-size: 16px; color: #333;">
                Has solicitado cambiar el email de tu cuenta. Ingresa el siguiente código:
              </p>

              <div style="background: #fef3c7; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px solid #fde68a;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #92400e;">
                  ${codigo}
                </span>
              </div>

              <p style="font-size: 14px; color: #666;">
                Este código expirará en <strong style="color: #d97706;">5 minutos</strong>.
              </p>

              <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #78350f;">
                  Si no solicitaste este cambio, ignora este mensaje.
                </p>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Mensaje automático, por favor no responder.
              </p>
            </div>
          </div>
        </body>
      </html>
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden;">
            <div style="background: #d97706; padding: 20px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Verifica tu cuenta</h1>
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">${saludo}</p>
              <p style="font-size: 16px; color: #333;">
                Usa este código para completar tu registro en PropBol:
              </p>

              <div style="background: #fef3c7; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px solid #fde68a;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #92400e;">
                  ${codigo}
                </span>
              </div>

              <p style="font-size: 14px; color: #666;">
                Este código expirará en <strong style="color: #d97706;">5 minutos</strong>.
              </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Mensaje automático, por favor no responder.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nExpira en 5 minutos.`,
  });
};
