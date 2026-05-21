import { prisma } from '../../lib/prisma.client.js'
import { publicacionesRepository } from '../publicaciones/publicaciones.repository.js'
import { Prisma } from '@prisma/client'

const createProperty = async (data: any, userId: number) => {
  const count = await publicacionesRepository.countByUser(userId)

  console.log('📊 Publicaciones actuales del usuario:', count)

  if (count >= 3) {
    throw new Error('LIMIT_REACHED')
  }

  const result = await prisma.$transaction(async (tx) => {
    const inmueble = await tx.inmueble.create({
      data: {
        titulo: data.titulo,
        tipoAccion: data.tipoAccion,
        categoria: data.categoria,
        precio: new Prisma.Decimal(data.precio),
        superficieM2: data.superficieM2 ? new Prisma.Decimal(data.superficieM2) : null,
        nroCuartos: data.nroCuartos,
        nroBanos: data.nroBanos,
        descripcion: data.descripcion,
        propietarioId: userId
      }
    })

    const publicacion = await tx.publicacion.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        usuarioId: userId,
        inmuebleId: inmueble.id
      }
    })

    await tx.ubicacionInmueble.create({
      data: {
        inmuebleId: inmueble.id,
        direccion: data.direccion,
        latitud: new Prisma.Decimal(data.latitud ?? 0),
        longitud: new Prisma.Decimal(data.longitud ?? 0),
        ciudad: data.ciudad ?? 'Cochabamba',
        zona: data.zona ?? null,
        verticesDifuminado: data.verticesDifuminado ?? null
      }
    })

    return { inmueble, publicacion }
  })

  return result
}

export default { createProperty }
