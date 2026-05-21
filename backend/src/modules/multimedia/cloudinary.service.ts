import type { UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'
import { cloudinary } from '../../config/cloudinary.js'
import { env } from '../../config/env.js'

type CloudinaryUploadImageResult = {
  url: string
  pesoMb: number
  publicId: string
}

const getCloudinaryFolder = (publicacionId: number) => {
  return `${env.CLOUDINARY_MULTIMEDIA_FOLDER}/${publicacionId}`
}

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  publicacionId: number
): Promise<CloudinaryUploadImageResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: getCloudinaryFolder(publicacionId),
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error('No se pudo subir la imagen a Cloudinary'))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          pesoMb: Number((file.size / (1024 * 1024)).toFixed(2))
        })
      }
    )

    Readable.from(file.buffer).pipe(uploadStream)
  })
}

