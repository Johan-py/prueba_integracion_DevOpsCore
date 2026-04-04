import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

// Verificar conexión
transporter.verify((error) => {
  if (error) {
    console.error(' Error en configuración de email:', error)
  } else {
    console.log(' Servicio de email listo')
  }
})

interface EnviarCodigoParams {
  emailDestino: string
  codigo: string
  nombreUsuario?: string
}

export const enviarCodigoCambioEmail = async ({
  emailDestino,
  codigo,
  nombreUsuario
}: EnviarCodigoParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"Mi App" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: ' Código de verificación - Cambio de email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #d97706; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verificación de Email</h1>
            </div>
            
            <div style="padding: 30px;">
              ${nombreUsuario ? `<p style="font-size: 16px; color: #333;">Hola <strong>${nombreUsuario}</strong>,</p>` : '<p style="font-size: 16px; color: #333;">Hola,</p>'}
              
              <p style="font-size: 16px; color: #333; margin-top: 15px;">
                Has solicitado cambiar el email de tu cuenta. Para continuar, ingresa el siguiente código de verificación:
              </p>
              
              <div style="background-color: #fef3c7; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px solid #fde68a;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #92400e;">${codigo}</span>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                 Este código expirará en <strong style="color: #d97706;">5 minutos</strong>.
              </p>
              
              <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #78350f;">
                   Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Este es un mensaje automático, por favor no responder.<br>
                © ${new Date().getFullYear()} Mi App. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verificación de cambio de email
        
        ${nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,'}
        
        Has solicitado cambiar el email de tu cuenta. Tu código de verificación es: ${codigo}
        
        Este código expirará en 5 minutos.
        
        Si no solicitaste este cambio, ignora este mensaje. Tu cuenta permanece segura.
        
        ---
        Este es un mensaje automático, por favor no responder.
      `
    })

    console.log(` Email enviado a ${emailDestino} - ID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(' Error al enviar email:', error)
    return { success: false, error }
  }
}

export const enviarCodigoRegistro = async ({
  emailDestino,
  codigo,
  nombreUsuario
}: EnviarCodigoParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"PropBol" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: ' Código de verificación - Registro PropBol',
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verifica tu cuenta</h1>
            </div>

            <div style="padding: 30px;">
              ${nombreUsuario ? `<p style="font-size: 16px; color: #333;">Hola <strong>${nombreUsuario}</strong>,</p>` : '<p style="font-size: 16px; color: #333;">Hola,</p>'}

              <p style="font-size: 16px; color: #333; margin-top: 15px;">
                Usa este código para completar tu registro en PropBol:
              </p>

              <div style="background-color: #fef3c7; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px solid #fde68a;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #92400e;">${codigo}</span>
              </div>

              <p style="font-size: 14px; color: #666;">
                 Este código expirará en <strong style="color: #d97706;">5 minutos</strong>.
              </p>
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
        Verifica tu cuenta en PropBol

        ${nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,'}

        Tu código de verificación es: ${codigo}

        Este código expirará en 5 minutos.
      `
    })

    console.log(` Email de registro enviado a ${emailDestino} - ID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(' Error al enviar email de registro:', error)
    return { success: false, error }
  }
}
