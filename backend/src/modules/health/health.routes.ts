import { Router } from 'express'
import * as healthController from './health.controller'

const router = Router()

router.get('/health', healthController.getHealth)

export default router
