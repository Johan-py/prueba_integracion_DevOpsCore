import { prisma } from "../../lib/prisma.client.js";

export const suscripcionesService = {
  /**
   * Obtiene la suscripción activa de un usuario
   */
  async obtenerSuscripcionActiva(usuario_id: number) {
    const hoy = new Date();

    const suscripcion = await prisma.suscripciones_activas.findFirst({
      where: {
        id_usuario: usuario_id,
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
  async tieneSuscripcionActiva(usuario_id: number): Promise<boolean> {
    const suscripcion = await this.obtenerSuscripcionActiva(usuario_id);
    return !!suscripcion;
  },

  /**
   * Obtiene los publicaciones permitidas para un usuario
   * - Si tiene suscripción activa: retorna el límite del plan
   * - Si no tiene suscripción: retorna 3 (límite gratuito)
   */
  async obtenerLimitePublicaciones(usuario_id: number): Promise<number> {
    const suscripcion = await this.obtenerSuscripcionActiva(usuario_id);

    if (suscripcion?.plan_suscripcion?.nro_publicaciones_plan) {
      return suscripcion.plan_suscripcion.nro_publicaciones_plan;
    }

    // Límite gratuito
    return 3;
  },

  /**
   * Verifica si el usuario puede crear más publicaciones
   */
  async puedeCrearPublicacion(usuario_id: number): Promise<{
    puede: boolean;
    limite: number;
    usadas: number;
    mensaje: string;
  }> {
    const limite = await this.obtenerLimitePublicaciones(usuario_id);
    const usadas = await prisma.publicacion.count({
      where: { usuario_id: usuario_id },
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

