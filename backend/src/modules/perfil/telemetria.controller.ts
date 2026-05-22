// modules/telemetria/telemetria.controller.ts
import type { Response } from "express";
import type { AuthRequest } from "../../middleware/validarJWT.js";
import { prisma } from "../../lib/prisma.client.js";

// Tipos para estadísticas
type DistribucionGenero = {
  MASCULINO: number;
  FEMENINO: number;
  OTRO: number;
  PREFIERO_NO_DECIR: number;
  NO_ESPECIFICADO: number;
};

type DistribucionEdad = {
  '0-18': number;
  '19-25': number;
  '26-35': number;
  '36-50': number;
  '51+': number;
  NO_ESPECIFICADO: number;
};

// Utilidades
function obtenerIPCliente(req: AuthRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIp = req.headers['x-real-ip'] as string;

  if (forwarded) return forwarded.split(',')[0];
  if (realIp) return realIp;
  return req.socket.remoteAddress || '0.0.0.0';
}

async function obtenerZonaDesdeIP(ip: string): Promise<string> {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return 'desarrollo_local';
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`);
    const data = await response.json();

    if (data.status === 'success') {
      return `${data.city}, ${data.regionName}, ${data.country}`;
    }
    return 'desconocida';
  } catch (error) {
    return 'error_obteniendo_zona';
  }
}

function calcularEdad(fechaNacimiento: Date | null): number | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesDiferencia = hoy.getMonth() - fechaNacimiento.getMonth();

  if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    return edad - 1;
  }
  return edad;
}

// Controller
export const telemetriaController = {
  // 🔥 Endpoint para cuando el usuario ACEPTA la telemetría en el modal
  async aceptarTelemetria(req: AuthRequest, res: Response) {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      const { genero, fecha_nacimiento } = req.body;

      // Capturar datos automáticos
      const ip = obtenerIPCliente(req);
      const userAgent = req.headers['user-agent'] || 'desconocido';
      const acceptLanguage = req.headers['accept-language'] || 'es';
      const zonaConexion = await obtenerZonaDesdeIP(ip);

      // Calcular edad si enviaron fecha_nacimiento
      let edad = null;
      let fechaNacimientoDate = null;

      if (fecha_nacimiento) {
        fechaNacimientoDate = new Date(fecha_nacimiento);
        edad = calcularEdad(fechaNacimientoDate);
      } else if (usuario.fecha_nacimiento) {
        edad = calcularEdad(usuario.fecha_nacimiento);
      }

      // Actualizar usuario con datos de telemetría
      const usuarioActualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          ...(genero && { genero }),
          ...(fechaNacimientoDate && { fecha_nacimiento: fechaNacimientoDate }),
          zona_conexion: usuario.zona_conexion || zonaConexion,
          telemetria_compartida: true,
          updatedAt: new Date()
        }
      });

      // Registrar en visitor
      await prisma.visitor.create({
        data: {
          ip: ip,
          meta_data: {
            userAgent,
            zona: zonaConexion,
            genero: genero || usuario.genero,
            edad: edad,
            pais: usuario.pais,
            idioma: acceptLanguage,
            timestamp: new Date().toISOString(),
            endpoint: req.originalUrl,
            metodo: req.method,
            telemetria_aceptada: true,
            tipo: "usuario_logueado"
          },
          fecha_visita: new Date(),
          usuario_id: usuario.id
        }
      });

      return res.status(200).json({
        success: true,
        message: "¡Gracias! Telemetría aceptada",
        data: {
          usuario_id: usuario.id,
          email: usuario.correo,
          genero: genero || usuario.genero,
          edad: edad,
          zona_conexion: zonaConexion,
          pais: usuario.pais,
          telemetria_compartida: true
        }
      });

    } catch (error) {
      console.error("Error aceptando telemetría:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  },

  // Endpoint para visitante NO logueado
  async telemetriaVisitante(req: AuthRequest, res: Response) {
    try {
      const { genero, rango_edad, zona_interes } = req.body;

      const ip = obtenerIPCliente(req);
      const userAgent = req.headers['user-agent'] || 'desconocido';
      const acceptLanguage = req.headers['accept-language'] || 'es';
      const zonaConexion = await obtenerZonaDesdeIP(ip);

      await prisma.visitor.create({
        data: {
          ip: ip,
          meta_data: {
            userAgent,
            zona: zonaConexion,
            genero: genero || null,
            rango_edad: rango_edad || null,
            zona_interes: zona_interes || null,
            idioma: acceptLanguage,
            timestamp: new Date().toISOString(),
            tipo: "visitante_no_autenticado",
            telemetria_aceptada: true
          },
          fecha_visita: new Date(),
          usuario_id: null
        }
      });

      return res.status(200).json({
        success: true,
        message: "Datos de visitante registrados",
        data: {
          tipo: "visitante",
          zona: zonaConexion,
          genero: genero || "no_especificado",
          rango_edad: rango_edad || "no_especificado"
        }
      });

    } catch (error) {
      console.error("Error en telemetría visitante:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  },

  // Obtener estado actual de telemetría
  async obtenerEstadoTelemetria(req: AuthRequest, res: Response) {
    try {
      const usuario = req.usuario;
      const edad = calcularEdad(usuario.fecha_nacimiento);

      return res.status(200).json({
        success: true,
        data: {
          telemetria_compartida: usuario.telemetria_compartida,
          datos_completos: {
            tiene_genero: !!usuario.genero,
            tiene_edad: !!usuario.fecha_nacimiento,
            tiene_zona: !!usuario.zona_conexion,
            genero_actual: usuario.genero,
            edad_actual: edad,
            zona_actual: usuario.zona_conexion
          }
        }
      });

    } catch (error) {
      console.error("Error obteniendo estado:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  },

  // Estadísticas para equipo de filtros
  async getEstadisticasFiltros(req: AuthRequest, res: Response) {
    try {
      if (req.usuario.rol?.nombre !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: "No autorizado - Solo administradores"
        });
      }

      const { fechaInicio, fechaFin } = req.query;

      const where: any = {};
      if (fechaInicio && fechaFin) {
        where.fechaRegistro = {
          gte: new Date(fechaInicio as string),
          lte: new Date(fechaFin as string)
        };
      }

      // Obtener usuarios
      const usuarios = await prisma.usuario.findMany({
        where: {
          ...where,
          telemetria_compartida: true
        },
        select: {
          genero: true,
          fecha_nacimiento: true,
          zona_conexion: true,
          pais: true
        }
      });

      // Obtener visitantes
      const visitantes = await prisma.visitor.findMany({
        where: {
          fecha_visita: {
            gte: fechaInicio ? new Date(fechaInicio as string) : undefined,
            lte: fechaFin ? new Date(fechaFin as string) : undefined
          }
        },
        select: {
          meta_data: true
        }
      });

      // Inicializar distribuciones con tipos correctos
      const distribucionGenero: DistribucionGenero = {
        MASCULINO: 0,
        FEMENINO: 0,
        OTRO: 0,
        PREFIERO_NO_DECIR: 0,
        NO_ESPECIFICADO: 0
      };

      const distribucionEdad: DistribucionEdad = {
        '0-18': 0,
        '19-25': 0,
        '26-35': 0,
        '36-50': 0,
        '51+': 0,
        NO_ESPECIFICADO: 0
      };

      const generoVisitantes: DistribucionGenero = {
        MASCULINO: 0,
        FEMENINO: 0,
        OTRO: 0,
        PREFIERO_NO_DECIR: 0,
        NO_ESPECIFICADO: 0
      };

      const edadVisitantes: DistribucionEdad = {
        '0-18': 0,
        '19-25': 0,
        '26-35': 0,
        '36-50': 0,
        '51+': 0,
        NO_ESPECIFICADO: 0
      };

      const zonas: Record<string, number> = {};
      const paises: Record<string, number> = {};

      // Procesar usuarios
      for (const u of usuarios) {
        // Género
        if (u.genero && distribucionGenero[u.genero as keyof DistribucionGenero] !== undefined) {
          distribucionGenero[u.genero as keyof DistribucionGenero]++;
        } else {
          distribucionGenero.NO_ESPECIFICADO++;
        }

        // Edad
        const edad = calcularEdad(u.fecha_nacimiento);
        if (edad) {
          if (edad <= 18) distribucionEdad['0-18']++;
          else if (edad <= 25) distribucionEdad['19-25']++;
          else if (edad <= 35) distribucionEdad['26-35']++;
          else if (edad <= 50) distribucionEdad['36-50']++;
          else distribucionEdad['51+']++;
        } else {
          distribucionEdad.NO_ESPECIFICADO++;
        }

        // Zonas
        if (u.zona_conexion) {
          zonas[u.zona_conexion] = (zonas[u.zona_conexion] || 0) + 1;
        }

        // Países
        if (u.pais) {
          paises[u.pais] = (paises[u.pais] || 0) + 1;
        }
      }

      // Procesar visitantes
      for (const v of visitantes) {
        const meta = v.meta_data as any;

        if (meta?.genero && generoVisitantes[meta.genero as keyof DistribucionGenero] !== undefined) {
          generoVisitantes[meta.genero as keyof DistribucionGenero]++;
        } else {
          generoVisitantes.NO_ESPECIFICADO++;
        }

        if (meta?.rango_edad && edadVisitantes[meta.rango_edad as keyof DistribucionEdad] !== undefined) {
          edadVisitantes[meta.rango_edad as keyof DistribucionEdad]++;
        } else {
          edadVisitantes.NO_ESPECIFICADO++;
        }
      }

      const zonasTop = Object.entries(zonas)
        .map(([zona, count]) => ({ zona, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return res.status(200).json({
        success: true,
        data: {
          usuarios: {
            total: usuarios.length,
            distribucion_genero: distribucionGenero,
            distribucion_edad: distribucionEdad,
            zonas_top: zonasTop,
            paises_top: Object.entries(paises)
              .map(([pais, count]) => ({ pais, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          },
          visitantes: {
            total: visitantes.length,
            distribucion_genero: generoVisitantes,
            distribucion_edad: edadVisitantes
          },
          total_telemetria: usuarios.length + visitantes.length,
          fecha_analisis: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }
};