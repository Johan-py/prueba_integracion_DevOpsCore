import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const enviarCorreo = async (
  para: string,
  asunto: string,
  texto: string,
) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: para,
      subject: asunto,
      text: texto,
    });
    console.log(`📧 Correo enviado a ${para}`);
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
};

export const notificarVencimiento = async (
  email: string,
  planNombre: string,
  fechaFin: Date,
) => {
  const fecha = fechaFin.toLocaleDateString();
  const asunto = "⚠️ Tu suscripción está por vencer";
  const texto = `Hola,\n\nTu suscripción al plan "${planNombre}" vencerá el ${fecha}. Renueva ahora para no perder tus beneficios.\n\n¡Gracias por confiar en PropBol!`;
  await enviarCorreo(email, asunto, texto);
};

const magicLinkTemplate = (magicLink: string, correo: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Tu enlace de acceso a PropBol</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Georgia,serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:480px;background-color:#ffffff;border-radius:12px;border:1px solid #e7e5e4;overflow:hidden;">

          <!-- Header amber -->
          <tr>
            <td style="background-color:#f59e0b;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">
                PropBol
              </p>
              <h1 style="margin:10px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                Tu enlace de acceso
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">

              <!-- Saludo -->
              <p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.6;">
                Hola,<br/>
                recibimos una solicitud para ingresar a PropBol con
                <strong style="color:#292524;">${correo}</strong>.
                Haz clic en el botón para acceder:
              </p>

              <!-- Botón CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}"
                      style="display:inline-block;background-color:#f59e0b;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.02em;">
                      Ingresar a PropBol
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Advertencia de expiración -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      ⏱ <strong>Este enlace expira en 15 minutos</strong> y solo puede usarse una vez.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Enlace alternativo -->
              <p style="margin:0 0 6px;font-size:12px;color:#a8a29e;">
                ¿El botón no funciona? Copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;font-size:11px;color:#78716c;word-break:break-all;line-height:1.5;">
                ${magicLink}
              </p>

              <!-- Divisor -->
              <hr style="border:none;border-top:1px solid #f0ede9;margin:0 0 20px;" />

              <!-- Nota de seguridad -->
              <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.6;">
                Si no solicitaste este enlace, puedes ignorar este correo. Tu cuenta permanece segura.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f4;padding:16px 32px;text-align:center;border-top:1px solid #e7e5e4;">
              <p style="margin:0;font-size:11px;color:#a8a29e;">
                © ${new Date().getFullYear()} PropBol · Bolivia
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>
`;

export const enviarMagicLink = async (
  correo: string,
  magicLink: string,
): Promise<void> => {
  const asunto = "🔑 Tu enlace de acceso a PropBol";
  const textoPlano = `Hola,\n\nHaz clic en el siguiente enlace para ingresar a PropBol:\n${magicLink}\n\nEste enlace expira en 15 minutos y solo puede usarse una vez.\n\nSi no solicitaste esto, ignora este correo.\n\n— PropBol`;

  try {
    await transporter.sendMail({
      from: `"PropBol" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: asunto,
      text: textoPlano,
      html: magicLinkTemplate(magicLink, correo),
    });
    console.log(`📧 Magic link enviado a ${correo}`);
  } catch (error) {
    console.error("Error al enviar magic link:", error);
    throw error;
  }
};
