import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { Prisma } from '@prisma/client'

export const crearPoi = async (req: Request, res: Response) => {
  const inmuebleId = parseInt(req.params.inmuebleId as string)

  if (isNaN(inmuebleId)) {
    return res.status(400).json({ mensaje: 'ID de inmueble inválido' })
  }

  const { nombre, latitud, longitud } = req.body

  if (!nombre || latitud === undefined || longitud === undefined) {
    return res.status(400).json({ mensaje: 'nombre, latitud y longitud son requeridos' })
  }

  try {
    const poi = await prisma.punto_interes.create({
      data: {
        nombre,
        latitud: new Prisma.Decimal(latitud),
        longitud: new Prisma.Decimal(longitud),
        inmueble_id: inmuebleId
      }
    })

    return res.status(201).json({ mensaje: 'Punto de interés guardado', poi })
  } catch (error) {
    console.error('Error al guardar POI:', error)
    return res.status(500).json({ mensaje: 'Error al guardar el punto de interés' })
  }
}
