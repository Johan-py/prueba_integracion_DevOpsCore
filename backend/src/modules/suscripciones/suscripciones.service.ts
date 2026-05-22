import { prisma } from "../../lib/prisma.client.js";

export const suscripcionesService = {
  /**
   * Obtiene la suscripción activa de un usuario
   */
  async obtenerSuscripcionActiva(usuarioId: number) {
    const hoy = new Date();

    const suscripcion = await prisma.suscripciones_activas.findFirst({
      where: {
        id_usuario: usuarioId,
        estado: "ACTIVA",
        fecha_inicio: { lte: hoy },
        fecha_fin: { gte: hoy },
      },
      include: {
        plan_suscripcion: true,
      },
    });

    return suscripcion;
  },

  /**
   * Verifica si el usuario tiene suscripción activa
   */
  async tieneSuscripcionActiva(usuarioId: number): Promise<boolean> {
    const suscripcion = await this.obtenerSuscripcionActiva(usuarioId);
    return !!suscripcion;
  },

  /**
   * Obtiene los publicaciones permitidas para un usuario
   * - Si tiene suscripción activa: retorna el límite del plan
   * - Si no tiene suscripción: retorna 3 (límite gratuito)
   */
  async obtenerLimitePublicaciones(usuarioId: number): Promise<number> {
    const suscripcion = await this.obtenerSuscripcionActiva(usuarioId);

    if (suscripcion?.plan_suscripcion?.nro_publicaciones_plan) {
      return suscripcion.plan_suscripcion.nro_publicaciones_plan;
    }

    // Límite gratuito
    return 3;
  },

  /**
   * Verifica si el usuario puede crear más publicaciones
   */
  async puedeCrearPublicacion(usuarioId: number): Promise<{
    puede: boolean;
    limite: number;
    usadas: number;
    mensaje: string;
  }> {
    const limite = await this.obtenerLimitePublicaciones(usuarioId);
    const usadas = await prisma.publicacion.count({
      where: { usuarioId },
    });

    const puede = usadas < limite;

    return {
      puede,
      limite,
      usadas,
      mensaje: puede
        ? "Puede crear más publicaciones"
        : `Ha alcanzado el límite de ${limite} publicaciones`,
    };
  },
};
