import { body } from 'express-validator';

export const validateCompareRequest = [
  body('ids')
    .exists().withMessage('El campo ids es requerido.')
    .isArray({ min: 1, max: 4 }).withMessage('Se requiere un arreglo de IDs (mínimo 1, máximo 4).'),
  
  // Validamos que cada elemento dentro del array sea un número válido
  body('ids.*')
    .custom((value) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`El valor '${value}' no es un ID numérico válido.`);
      }
      return true;
    })
];