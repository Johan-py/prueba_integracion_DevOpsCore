import { body } from "express-validator";

export const propertyValidationRules = [
  body("titulo")
    .isLength({ min: 20, max: 80 })
    .withMessage("El título debe tener entre 20 y 80 caracteres")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("El título solo puede contener caracteres alfanuméricos"),

  body("tipoAccion")
    .isIn(["VENTA", "ALQUILER", "ANTICRETO"])
    .withMessage("Tipo de operación inválido"),

  body("categoria")
    .isIn(["CASA", "DEPARTAMENTO", "TERRENO", "OFICINA"])
    .withMessage("Tipo de inmueble inválido"),

  body("precio")
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser un número positivo"),

  body("superficieM2")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("El área debe ser un número positivo"),

  body("nroCuartos")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("El número de habitaciones debe ser positivo"),

  body("direccion")
    .isLength({ min: 5 })
    .withMessage("La dirección debe tener al menos 5 caracteres"),

  body("descripcion")
    .isLength({ min: 50, max: 300 })
    .withMessage("La descripción debe tener entre 50 y 300 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()]+$/)
    .withMessage(
      "La descripción solo puede contener caracteres alfanuméricos y básicos",
    ),
];
