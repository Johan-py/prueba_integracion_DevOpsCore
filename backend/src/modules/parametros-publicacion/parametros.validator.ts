import { body } from 'express-validator'

export const createParametroPersonalizadoRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 60 })
    .withMessage('El nombre debe tener entre 3 y 60 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('La descripción no puede exceder 300 caracteres')
]

export const replacePublicationParametersRules = [
  body('parametros').isArray().withMessage('parametros debe ser un arreglo'),

  body('parametros.*.parametroId')
    .isInt({ min: 1 })
    .withMessage('parametroId debe ser un entero válido'),

  body('parametros.*.valor')
    .optional({ nullable: true })
    .isString()
    .withMessage('valor debe ser texto')
]
