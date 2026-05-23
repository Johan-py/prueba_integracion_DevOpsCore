import type { Request, Response } from 'express'
import { Readable } from 'stream'
import { prisma } from '../../lib/prisma.client.js'
import { cloudinary } from '../../config/cloudinary.js'

const toMessage = (e: unknown) => (e instanceof Error ? e.message : 'Error interno')

// Carpeta dedicada para los QR de pago de los planes en Cloudinary.
const QR_FOLDER = 'propbol/planes/qr'

// HU-10 (criterio 10): el admin adjunta una imagen de QR; se sube a storage y se
// devuelve la URL para guardarla en el plan. La validación de formato/tamaño la hace multer.
export const subirQrPlan = async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'No se adjuntó ninguna imagen' })

    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: QR_FOLDER, resource_type: 'image', use_filename: true, unique_filename: true, overwrite: false },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('No se pudo subir el QR'))
            return
          }
          resolve(result.secure_url)
        }
      )
      Readable.from(file.buffer).pipe(stream)
    })

    return res.status(201).json({ imagen_gr_url: url })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const listarPlanes = async (_req: Request, res: Response) => {
  try {
    const planes = await prisma.plan_suscripcion.findMany({ where: { eliminado_en: null }, orderBy: { id: 'asc' } })
    return res.json(
      planes.map((p) => ({
        id: p.id,
        nombre_plan: p.nombre_plan,
        descripcion_plan: p.descripcion_plan,
        precio_plan: Number(p.precio_plan),
        duracion_plan_dias: p.duracion_plan_dias,
        nro_publicaciones_plan: p.nro_publicaciones_plan,
        imagen_gr_url: p.imagen_gr_url,
      }))
    )
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const crearPlan = async (req: Request, res: Response) => {
  try {
    const { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url } = req.body
    // Criterio 3/4 HU-10: nombre, precio, descripción y QR son obligatorios.
    if (!nombre_plan?.trim() || precio_plan === undefined || precio_plan === null) {
      return res.status(400).json({ error: 'nombre_plan y precio_plan son requeridos' })
    }
    if (!descripcion_plan?.trim()) {
      return res.status(400).json({ error: 'La descripción es requerida' })
    }
    if (Number(precio_plan) > 0 && !imagen_gr_url) {
      return res.status(400).json({ error: 'El QR de pago es requerido para planes de pago' })
    }
    if (Number(precio_plan) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }
    const duplicado = await prisma.plan_suscripcion.findFirst({
      where: { nombre_plan: { equals: nombre_plan, mode: 'insensitive' }, eliminado_en: null },
    })
    if (duplicado) {
      return res.status(409).json({ error: `Ya existe un plan con el nombre "${nombre_plan}"` })
    }
    const plan = await prisma.plan_suscripcion.create({
      data: { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url },
    })
    return res.status(201).json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      descripcion_plan: plan.descripcion_plan,
      precio_plan: Number(plan.precio_plan),
      duracion_plan_dias: plan.duracion_plan_dias,
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const actualizarPlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url } = req.body
    if (precio_plan !== undefined && Number(precio_plan) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }
    if (nombre_plan) {
      const duplicado = await prisma.plan_suscripcion.findFirst({
        where: { nombre_plan: { equals: nombre_plan, mode: 'insensitive' }, eliminado_en: null, NOT: { id } },
      })
      if (duplicado) {
        return res.status(409).json({ error: `Ya existe un plan con el nombre "${nombre_plan}"` })
      }
    }
    const plan = await prisma.plan_suscripcion.update({
      where: { id },
      data: { nombre_plan, descripcion_plan, precio_plan, duracion_plan_dias, nro_publicaciones_plan, imagen_gr_url },
    })
    return res.json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      descripcion_plan: plan.descripcion_plan,
      precio_plan: Number(plan.precio_plan),
      duracion_plan_dias: plan.duracion_plan_dias,
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

export const eliminarPlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    // Soft delete: el plan deja de ofrecerse a nuevos usuarios, pero las
    // suscripciones activas conservan su referencia y siguen vigentes hasta vencer.
    await prisma.plan_suscripcion.update({ where: { id }, data: { eliminado_en: new Date() } })
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: toMessage(e) })
  }
}

