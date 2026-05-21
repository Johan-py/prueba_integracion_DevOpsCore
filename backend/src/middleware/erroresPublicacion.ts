// erroresPublicacion.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const reglasValidacionHU5 = [
  body("titulo")
    .isLength({ min: 20, max: 80 })
    .withMessage("El título debe tener entre 20 y 80 caracteres"),
  body("descripcion")
    .isLength({ min: 50, max: 300 })
    .withMessage("La descripción debe tener entre 50 y 300 caracteres"),
  body("direccion")
    .isLength({ min: 5 })
    .withMessage("La dirección debe tener al menos 5 caracteres"),
  body("precio")
    .isNumeric()
    .withMessage("El precio debe ser un número válido"),
];

// Manejo de errores de validación HU‑5
export const manejarErroresPublicacion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const agrupados: Record<string, { campo: string; mensaje: string }[]> = {
      informacionBasica: [],
      ubicacion: [],
      detalles: [],
    };

    errors.array().forEach((err: any) => {
      const campo = err.param || "desconocido";
      const mensaje = err.msg || "Error sin mensaje";

      if (["titulo", "precio"].includes(campo)) {
        agrupados.informacionBasica.push({ campo, mensaje });
      } else if (["direccion"].includes(campo)) {
        agrupados.ubicacion.push({ campo, mensaje });
      } else if (["descripcion"].includes(campo)) {
        agrupados.detalles.push({ campo, mensaje });
      }
    });

    return res.status(400).json({
      estado: "Pendiente de revisión",
      totalErrores: errors.array().length,
      errores: agrupados,
      progress: 0, // BUG‑E02: progreso inicial
    });
  }
  next();
};

//  Validar etapa final 
export const validarEtapaFinal = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.step !== "final") {
    return res.status(400).json({
      error: "FORM_INCOMPLETE",
      message: "Debes completar todas las etapas antes de publicar.",
      progress: 20,
    });
  }
  next();
};

// Cancelación explícita 
export const validarCancelacion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.cancelado === true) {
    return res.status(400).json({
      error: "PUBLICATION_CANCELLED",
      message: "La publicación fue cancelada por el usuario.",
      progress: 50,
    });
  }
  next();
};
