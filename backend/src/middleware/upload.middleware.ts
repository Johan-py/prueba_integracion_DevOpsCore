import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve('uploads/perfiles')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes JPG o PNG'))
  }

  cb(null, true)
}

export const uploadPerfilAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})