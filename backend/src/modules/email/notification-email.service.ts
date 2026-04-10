import nodemailer from 'nodemailer'

const emailUser = process.env.EMAIL_USER
const emailPassword = process.env.EMAIL_PASSWORD

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword
  }
})

export const verifyNotificationEmailTransport = async () => {
  if (!emailUser || !emailPassword) {
    throw new Error('Las credenciales de email no están configuradas')
  }

  await transporter.verify()
}

type SendNotificationEmailParams = {
  emailDestino: string
  titulo: string
  mensaje: string
  nombreUsuario?: string
}

export const sendNotificationEmail = async ({
  emailDestino,
  titulo,
  mensaje,
  nombreUsuario
}: SendNotificationEmailParams) => {
  try {
    if (!emailUser || !emailPassword) {
      throw new Error('Las credenciales de email no están configuradas')
    }

    const saludo = nombreUsuario
      ? `<p style="font-size: 16px; color: #333;">Hola <strong>${nombreUsuario}</strong>,</p>`
      : '<p style="font-size: 16px; color: #333;">Hola,</p>'

    const info = await transporter.sendMail({
      from: `"PropBol" <${emailUser}>`,
      to: emailDestino,
      subject: `Nueva notificación - ${titulo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #d97706; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nueva notificación</h1>
            </div>

            <div style="padding: 30px;">
              ${saludo}

              <p style="font-size: 16px; color: #333; margin-top: 15px;">
                Has recibido una nueva notificación en PropBol:
              </p>

              <div style="background-color: #fffbeb; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #fde68a;">
                <h2 style="font-size: 20px; color: #92400e; margin: 0 0 12px 0;">${titulo}</h2>
                <p style="font-size: 15px; color: #444; margin: 0;">${mensaje}</p>
              </div>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Este es un mensaje automático, por favor no responder.<br />
                © ${new Date().getFullYear()} PropBol.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nueva notificación en PropBol

${nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,'}

Título: ${titulo}

Mensaje:
${mensaje}

---
Este es un mensaje automático, por favor no responder.
      `
    })

    console.log(`Email de notificación enviado a ${emailDestino} - ID: ${info.messageId}`)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Error al enviar email de notificación:', error)

    return {
      success: false,
      error
    }
  }
}
