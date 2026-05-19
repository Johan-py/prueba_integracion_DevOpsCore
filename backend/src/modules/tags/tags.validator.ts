import { body } from "express-validator";

export const replaceTagsRules = [
  body("tags")
    .isArray({ max: 15 })
    .withMessage("Los tags deben ser un arreglo de máximo 15 elementos"),
  body("tags.*")
    .isString()
    .withMessage("Cada tag debe ser texto")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Cada tag debe tener entre 3 y 30 caracteres")
    .matches(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s\-]+$/)
    .withMessage("El tag contiene caracteres no permitidos"),
];
