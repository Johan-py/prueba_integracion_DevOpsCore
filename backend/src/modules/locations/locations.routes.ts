import { Router } from 'express';
import { locationsController } from './locations.controller.js';

const router = Router();

router.get('/departamentos', locationsController.getDepartamentos);
router.get('/departamentos/:deptoId/provincias', locationsController.getProvincias);
router.get('/provincias/:provId/municipios', locationsController.getMunicipios);
router.get('/municipios/:munId/zonas', locationsController.getZonas);
router.get('/zonas/:zonaId/barrios', locationsController.getBarrios);

export default router;