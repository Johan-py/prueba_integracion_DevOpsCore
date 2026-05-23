import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { validarJWT } from '../../middleware/validarJWT.js'
import { validarAdmin } from '../../middleware/validarAdmin.js'
import { listarPlanes, crearPlan, actualizarPlan, eliminarPlan, subirQrPlan } from './adminPlanes.controller.js'

const router = Router()

// Rate limiting para las rutas admin de planes: protege endpoints autenticados
// y de subida de archivos contra abuso (100 req / 15 min por IP).
const adminPlanesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
router.use(adminPlanesLimiter)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Formato no permitido. Solo PNG, JPG o JPEG'))
      return
    }
    cb(null, true)
  },
})

// Convierte los errores de multer (formato/tamaño) en respuestas JSON claras (criterio 10).
const uploadQr = (req: Request, res: Response, next: NextFunction) => {
  upload.single('qr')(req, res, (err: unknown) => {
    if (err) {
      const msg =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo supera el tamaño máximo de 5 MB'
          : err instanceof Error
            ? err.message
            : 'Error al subir el archivo'
      return res.status(400).json({ error: msg })
    }
    next()
  })
}

router.get('/planes', validarJWT, validarAdmin, listarPlanes)
router.post('/planes', validarJWT, validarAdmin, crearPlan)
router.post('/planes/qr', validarJWT, validarAdmin, uploadQr, subirQrPlan)
router.put('/planes/:id', validarJWT, validarAdmin, actualizarPlan)
router.delete('/planes/:id', validarJWT, validarAdmin, eliminarPlan)

export default router

