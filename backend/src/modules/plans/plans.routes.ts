import { Router } from 'express'
import { verificarToken } from '../../middleware/auth.ts'
import { getPlanes } from './plans.controller.ts'

const router = Router();

router.get("/membership-plans", verificarToken, getPlanes);

export default router;
