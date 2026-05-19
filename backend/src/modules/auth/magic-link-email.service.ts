import { env } from "../../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type MagicLinkEmailParams = {
  emailDestino: string;
  magicLink: string;
  nombreUsuario?: string;
  minutosExpiracion: number;
};

type EmailSendResult = {
  success: boolean;
  messageId?: string;
  error?: unknown;
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const sendMagicLinkEmail = async ({
  emailDestino,
  magicLink,
  nombreUsuario,
  minutosExpiracion,
}: MagicLinkEmailParams): Promise<EmailSendResult> => {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error("❌ BREVO_API_KEY no está configurado");

    return {
      success: false,
      error: "BREVO_API_KEY no está configurado",
    };
  }

  const safeNombre = nombreUsuario ? escapeHtml(nombreUsuario) : "";
  const safeMagicLink = escapeHtml(magicLink);
  const saludo = safeNombre ? `Hola ${safeNombre},` : "Hola,";

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "PropBol",
          email: env.EMAIL_USER,
        },
        to: [
          {
            email: emailDestino,
          },
        ],
        subject: "Tu link mágico para ingresar a PropBol",
        htmlContent: `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Tu link mágico para ingresar a PropBol</title>
            </head>

            <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 32px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #eeeeee;">
                      
                      <tr>
  <td align="center" style="padding: 28px 32px 12px;">
    <span style="font-size: 26px; font-weight: 800; color: #111827;">
      Prop<span style="color: #D97706;">Bol</span>
    </span>
  </td>
</tr>

                      <tr>
                        <td style="padding: 0 32px;">
                          <div style="height: 1px; background-color: #D97706; line-height: 1px;">&nbsp;</div>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 26px 32px 10px;">
                          <h1 style="margin: 0; color: #1f2937; font-size: 21px; line-height: 1.35; font-weight: 800;">
                            Tu link mágico para ingresar a PropBol
                          </h1>

                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 8px 32px 0;">
                          <p style="margin: 0 0 14px; color: #374151; font-size: 14px; line-height: 1.7;">
                            ${saludo}
                          </p>

                          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.7;">
                            Solicitaste iniciar sesión sin contraseña en PropBol.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 26px 32px 18px;">
                          <a
                            href="${safeMagicLink}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="display: inline-block; width: 320px; max-width: 100%; background-color: #ff5a00; color: #ffffff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 800; padding: 13px 0; border-radius: 6px;"
                          >
                            Ingresar a PropBol
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 0 32px 24px;">
                          <p style="margin: 0; color: #8a8f98; font-size: 13px; line-height: 1.6;">
                            Este enlace expirará en ${minutosExpiracion} minutos y solo puede utilizarse una vez.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 0 32px;">
                          <div style="height: 1px; background-color: #eeeeee; line-height: 1px;">&nbsp;</div>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 24px 32px 34px;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.7;">
                            Si no solicitaste este acceso, puedes ignorar este correo.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        textContent: `${saludo}

        Tu link mágico para ingresar a PropBol.

        Solicitaste iniciar sesión sin contraseña en PropBol.

        Ingresa usando este enlace:
        ${magicLink}

        Este enlace expirará en ${minutosExpiracion} minutos y solo puede utilizarse una vez.

        Si no solicitaste este acceso, puedes ignorar este correo.`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      console.error("❌ Error al enviar Magic Link:", errorData);

      return {
        success: false,
        error: errorData,
      };
    }

    const data = (await response.json()) as { messageId?: string };

    console.log(
      `✅ Magic Link enviado a ${emailDestino} - ID: ${data.messageId}`,
    );

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("❌ Error al enviar Magic Link:", error);

    return {
      success: false,
      error,
    };
  }
};
