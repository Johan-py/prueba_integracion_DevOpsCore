import type { Request, Response } from "express";
import { EstadisticasPublicacionService } from "./estadisticas.service.js";

type AuthRequest = Request & {
  user?: {
    id: number;
    correo?: string;
  };
};

function obtenerIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "ip_desconocida";
}

function obtenerVisitorToken(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const visitorCookie = cookies.find((cookie) =>
    cookie.startsWith("visitor_token="),
  );

  if (!visitorCookie) {
    return undefined;
  }

  return decodeURIComponent(visitorCookie.split("=")[1]);
}

export class EstadisticasPublicacionController {
  static async registrarVista(req: AuthRequest, res: Response) {
    try {
      const publicacionId = Number(req.params.publicacionId);

      if (Number.isNaN(publicacionId)) {
        return res.status(400).json({
          ok: false,
          mensaje: "El id de la publicación no es válido.",
        });
      }

      const usuarioId = req.user?.id;
      const visitorToken = obtenerVisitorToken(req);
      const ip = obtenerIp(req);
      const userAgent = req.headers["user-agent"];

      const resultado = await EstadisticasPublicacionService.registrarVista({
        publicacionId,
        usuarioId,
        visitorToken,
        ip,
        userAgent,
      });

      if (resultado.visitorToken) {
        res.cookie("visitor_token", resultado.visitorToken, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
      }

      return res.status(200).json({
        ok: true,
        ...resultado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PUBLICACION_NO_EXISTE") {
        return res.status(404).json({
          ok: false,
          mensaje: "La publicación no existe.",
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: "Error al registrar la visualización.",
      });
    }
  }

  static async registrarVistaPorInmueble(req: AuthRequest, res: Response) {
    try {
      const inmuebleId = Number(req.params.inmuebleId);

      if (Number.isNaN(inmuebleId)) {
        return res.status(400).json({
          ok: false,
          mensaje: "El id del inmueble no es válido.",
        });
      }

      const usuarioId = req.user?.id;
      const visitorToken = obtenerVisitorToken(req);
      const ip = obtenerIp(req);
      const userAgent = req.headers["user-agent"];

      const resultado =
        await EstadisticasPublicacionService.registrarVistaPorInmueble({
          inmuebleId,
          usuarioId,
          visitorToken,
          ip,
          userAgent,
        });

      if (resultado.visitorToken) {
        res.cookie("visitor_token", resultado.visitorToken, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
      }

      return res.status(200).json({
        ok: true,
        ...resultado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PUBLICACION_NO_EXISTE") {
        return res.status(404).json({
          ok: false,
          mensaje: "No existe una publicación activa para este inmueble.",
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: "Error al registrar la visualización.",
      });
    }
  }

  static async registrarCompartido(req: AuthRequest, res: Response) {
    try {
      const publicacionId = Number(req.params.publicacionId);
      const usuarioId = req.user?.id;
      const { medio } = req.body as { medio?: string };

      if (!usuarioId) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debe iniciar sesión para compartir una publicación.",
        });
      }

      if (Number.isNaN(publicacionId)) {
        return res.status(400).json({
          ok: false,
          mensaje: "El id de la publicación no es válido.",
        });
      }

      const resultado =
        await EstadisticasPublicacionService.registrarCompartido({
          publicacionId,
          usuarioId,
          medio,
        });

      return res.status(200).json({
        ok: true,
        ...resultado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PUBLICACION_NO_EXISTE") {
        return res.status(404).json({
          ok: false,
          mensaje: "La publicación no existe.",
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: "Error al registrar el compartido.",
      });
    }
  }

  static async registrarCompartidoPorInmueble(req: AuthRequest, res: Response) {
    try {
      const inmuebleId = Number(req.params.inmuebleId);
      const usuarioId = req.user?.id;
      const { medio } = req.body as { medio?: string };

      if (!usuarioId) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debe iniciar sesión para compartir una publicación.",
        });
      }

      if (Number.isNaN(inmuebleId)) {
        return res.status(400).json({
          ok: false,
          mensaje: "El id del inmueble no es válido.",
        });
      }

      const resultado =
        await EstadisticasPublicacionService.registrarCompartidoPorInmueble({
          inmuebleId,
          usuarioId,
          medio,
        });

      return res.status(200).json({
        ok: true,
        ...resultado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PUBLICACION_NO_EXISTE") {
        return res.status(404).json({
          ok: false,
          mensaje: "No existe una publicación activa para este inmueble.",
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: "Error al registrar el compartido.",
      });
    }
  }

  static async obtenerEstadisticas(req: AuthRequest, res: Response) {
    try {
      const publicacionId = Number(req.params.publicacionId);
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debe iniciar sesión para ver las estadísticas.",
        });
      }

      if (Number.isNaN(publicacionId)) {
        return res.status(400).json({
          ok: false,
          mensaje: "El id de la publicación no es válido.",
        });
      }

      const estadisticas =
        await EstadisticasPublicacionService.obtenerEstadisticas({
          publicacionId,
          usuarioId,
        });

      return res.status(200).json({
        ok: true,
        data: estadisticas,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PUBLICACION_NO_EXISTE") {
        return res.status(404).json({
          ok: false,
          mensaje: "La publicación no existe.",
        });
      }

      if (error instanceof Error && error.message === "NO_ES_PROPIETARIO") {
        return res.status(403).json({
          ok: false,
          mensaje:
            "No tiene permiso para ver las estadísticas de esta publicación.",
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: "Error al obtener estadísticas.",
      });
    }
  }

  static async obtenerMisPropiedadesVistas(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debe iniciar sesión para ver sus propiedades vistas.",
        });
      }

      const propiedades =
        await EstadisticasPublicacionService.obtenerMisPropiedadesVistas(
          usuarioId,
        );

      return res.status(200).json({
        ok: true,
        data: propiedades,
      });
    } catch {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al obtener las propiedades vistas.",
      });
    }
  }
}
