import { Request, Response } from 'express';

const planes = [
  {
    id: 1,
    name: 'Básico',
    price: 0,
    description: 'Publicaciones gratuitas limitadas'
  },
  {
    id: 2,
    name: 'Estándar',
    price: 9.99,
    description: 'Más publicaciones y soporte prioritario'
  },
  {
    id: 3,
    name: 'Pro',
    price: 19.99,
    description: 'Publicaciones ilimitadas + estadísticas'
  }
];

export const getPlanes = async (req: Request, res: Response) => {
  try {
    const planesValidos = planes.filter(
      plan => plan.price !== null && plan.price !== undefined && plan.price >= 0
    );
    
    res.json(planesValidos);
  } catch  {
    res.status(500).json({
      error: 'Error del servidor',
      message: 'No se pudieron cargar los planes'
    });
  }
};