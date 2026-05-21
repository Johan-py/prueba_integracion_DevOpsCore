import { env } from "../../config/env.js";

interface EnviarMensajeParams {
  telefono: string;   // Número con código de país, ej: "59171234567"
  mensaje: string;
}

interface WhatsappSendResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

/**
 * Formatea un número de teléfono para Evolution API.
 * Evolution espera el formato: codigoPais + numero, sin '+', sin espacios.
 * Ej: codigoPais="591", numero="71234567" → "59171234567"
 */
export const formatearTelefono = (codigoPais: string, numero: string): string => {
  // Limpiar cualquier '+', espacios o guiones
  const codigoLimpio = codigoPais.replace(/[^0-9]/g, "");
  const numeroLimpio = numero.replace(/[^0-9]/g, "");
  return `${codigoLimpio}${numeroLimpio}`;
};

/**
 * Envía un mensaje de WhatsApp usando Evolution API.
 */
export const enviarMensajeWhatsapp = async ({
  telefono,
  mensaje,
}: EnviarMensajeParams): Promise<WhatsappSendResult> => {
  try {
    if (!env.EVOLUTION_API_KEY) {
      console.warn("⚠️  EVOLUTION_API_KEY no configurada, omitiendo WhatsApp");
      return { success: false, error: "API key no configurada" };
    }

    const url = `${env.EVOLUTION_API_URL}/message/sendText/${env.EVOLUTION_INSTANCE}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: `${telefono}@s.whatsapp.net`,
        textMessage: { text: mensaje },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error al enviar WhatsApp:', JSON.stringify(errorData, null, 2));
        return { success: false, error: errorData };
    }

    const data = (await response.json()) as { key?: { id?: string } };
    const messageId = data?.key?.id;
    console.log(`✅ WhatsApp enviado a ${telefono} - ID: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    console.error("❌ Error al enviar WhatsApp:", error);
    return { success: false, error };
  }
};