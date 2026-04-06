import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// Generar Pago QR
export const generarPagoQr = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { monto, usuarioId, suscripcionId = 1 } = req.body;

    const nuevoPago = await prisma.transacciones.create({
      data: {
        id_usuario: parseInt(usuarioId),
        id_suscripcion: parseInt(suscripcionId),
        subtotal: parseFloat(monto),
        iva_porcentaje: 0,
        iva_monto: 0,
        total: parseFloat(monto),
        metodo_pago: "QR_BANCARIO",
        estado: "PENDIENTE",
        verificacion_requerida: true,
      },
    });

    res
      .status(200)
      .json({ mensaje: "Pago generado con éxito", pago: nuevoPago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al generar el pago QR" });
  }
};

export const obtenerPagoPendiente = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { usuarioId } = req.params;

    const pagoPendiente = await prisma.transacciones.findFirst({
      where: {
        id_usuario: Number(usuarioId),
        estado: "PENDIENTE",
      },
      orderBy: { fecha_intento: "desc" },
    });

    if (!pagoPendiente) {
      res.status(404).json({ mensaje: "Sin pagos pendientes", pago: null });
      return;
    }

    const fechaIntento = pagoPendiente.fecha_intento
      ? new Date(pagoPendiente.fecha_intento)
      : new Date();
    const fechaExpiracion = new Date(fechaIntento.getTime() + 5 * 60000); //5 minutos de validez

    res.status(200).json({
      id: pagoPendiente.id.toString(),
      monto: Number(pagoPendiente.total),
      referencia: `PAY-${pagoPendiente.id}`,
      qrContent: "000201010211_TU_CODIGO_QR_BANCARIO_AQUI",
      estado: pagoPendiente.estado?.toLowerCase(),
      fechaExpiracion: fechaExpiracion.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar pago pendiente" });
  }
};

export const consultarEstadoPago = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const pago = await prisma.transacciones.findUnique({
      where: { id: Number(id) },
      select: { estado: true },
    });

    if (!pago) {
      res.status(404).json({ error: "Pago no encontrado" });
      return;
    }

    res.status(200).json({ estado: pago.estado?.toLowerCase() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar estado" });
  }
};

// Actualizar Estado
export const actualizarEstadoPago = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    const pagoActualizado = await prisma.transacciones.update({
      where: { id: Number(id) },
      data: {
        estado: nuevoEstado,
        fecha_completado: nuevoEstado === "COMPLETADO" ? new Date() : null,
      },
    });

    res
      .status(200)
      .json({ mensaje: "Estado del pago actualizado", pago: pagoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado del pago" });
  }
};
