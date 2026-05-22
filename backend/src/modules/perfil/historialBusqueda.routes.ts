import { Router } from 'express';
import { getHistorialBusqueda, guardarBusqueda, eliminarBusqueda } from './historialBusqueda.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// Ruta: /api/perfil/historial/busqueda
router.get('/', requireAuth, getHistorialBusqueda);
router.post('/', requireAuth, guardarBusqueda);
router.delete('/:termino', requireAuth, eliminarBusqueda);

export default router;