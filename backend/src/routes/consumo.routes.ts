import { Router } from 'express'
import { getConsumo } from '../controllers/consumo.controllers.ts'
import { getPlanLimit } from '../controllers/planController.ts'; 
// import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router();

// 🔥 SIN TOKEN (para probar)
router.get("/consumo/:userId", getConsumo);

router.get("/limite", getPlanLimit);
export default router;
