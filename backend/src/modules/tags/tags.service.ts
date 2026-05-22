import type { Prisma, Categoria, TipoAccion } from '@prisma/client'
import { tagsRepository } from './tags.repository.js'

const MAX_TAGS = 15
const TASA_CAMBIO_BOB = 6.96

type TagsContextFilters = {
  tipoInmueble?: string
  modoInmueble?: string
  minPrice?: number | null
  maxPrice?: number | null
  currency?: string | null
  minSuperficie?: number | null
  maxSuperficie?: number | null
  dormitoriosMin?: number
  dormitoriosMax?: number
  banosMin?: number
  banosMax?: number
  departamentoId?: string
  provinciaId?: string
  municipioId?: string
  zonaId?: string
  barrioId?: string
}

const CATEGORIAS_VALIDAS = [
  'CASA',
  'DEPARTAMENTO',
  'TERRENO',
  'OFICINA',
  'CUARTO',
  'TERRENO_MORTUORIO'
] as const

const MODOS_VALIDOS = ['VENTA', 'ALQUILER', 'ANTICRETO'] as const

const esCategoriaValida = (valor: string): valor is Categoria => {
  return (CATEGORIAS_VALIDAS as readonly string[]).includes(valor)
}

const esTipoAccionValido = (valor: string): valor is TipoAccion => {
  return (MODOS_VALIDOS as readonly string[]).includes(valor)
}

const buildInmuebleWhereFromFilters = (filtros: TagsContextFilters): Prisma.InmuebleWhereInput => {
  const where: Prisma.InmuebleWhereInput = {
    estado: 'ACTIVO'
  }

  if (filtros.tipoInmueble && filtros.tipoInmueble !== 'CUALQUIER TIPO') {
    const tipoNormalizado = filtros.tipoInmueble.toUpperCase().trim()
    if (esCategoriaValida(tipoNormalizado)) {
      where.categoria = tipoNormalizado
    }
  }

  if (filtros.modoInmueble) {
    const modoNormalizado = filtros.modoInmueble.toUpperCase().trim()
    const modoFinal = modoNormalizado.includes('ANTICR') ? 'ANTICRETO' : modoNormalizado

    if (esTipoAccionValido(modoFinal)) {
      where.tipoAccion = modoFinal
    }
  }

  let minPrice = filtros.minPrice ?? null
  let maxPrice = filtros.maxPrice ?? null

  if (filtros.currency && ['BOB', 'BS'].includes(filtros.currency.toUpperCase())) {
    if (minPrice != null) minPrice = minPrice / TASA_CAMBIO_BOB
    if (maxPrice != null) maxPrice = maxPrice / TASA_CAMBIO_BOB
  }

  if (minPrice != null || maxPrice != null) {
    where.precio = {
      ...(minPrice != null ? { gte: minPrice } : {}),
      ...(maxPrice != null ? { lte: maxPrice } : {})
    }
  }

  if (filtros.minSuperficie != null || filtros.maxSuperficie != null) {
    where.superficieM2 = {
      ...(filtros.minSuperficie != null ? { gte: filtros.minSuperficie } : {}),
      ...(filtros.maxSuperficie != null ? { lte: filtros.maxSuperficie } : {})
    }
  }

  if (filtros.dormitoriosMin !== undefined || filtros.dormitoriosMax !== undefined) {
    where.nroCuartos = {
      ...(filtros.dormitoriosMin !== undefined ? { gte: filtros.dormitoriosMin } : {}),
      ...(filtros.dormitoriosMax !== undefined ? { lte: filtros.dormitoriosMax } : {})
    }
  }

  if (filtros.banosMin !== undefined || filtros.banosMax !== undefined) {
    where.nroBanos = {
      ...(filtros.banosMin !== undefined ? { gte: filtros.banosMin } : {}),
      ...(filtros.banosMax !== undefined ? { lte: filtros.banosMax } : {})
    }
  }

  if (filtros.barrioId && filtros.barrioId !== 'todos') {
    where.ubicacion = { barrio_id: Number(filtros.barrioId) }
  } else if (filtros.zonaId && filtros.zonaId !== 'todos') {
    where.ubicacion = { barrio: { zona_id: Number(filtros.zonaId) } }
  } else if (filtros.municipioId && filtros.municipioId !== 'todos') {
    where.ubicacion = {
      barrio: { zona: { municipio_id: Number(filtros.municipioId) } }
    }
  } else if (filtros.provinciaId && filtros.provinciaId !== 'todos') {
    where.ubicacion = {
      barrio: {
        zona: { municipio: { provincia_id: Number(filtros.provinciaId) } }
      }
    }
  } else if (filtros.departamentoId && filtros.departamentoId !== 'todos') {
    where.ubicacion = {
      barrio: {
        zona: {
          municipio: {
            provincia: { departamento_id: Number(filtros.departamentoId) }
          }
        }
      }
    }
  }

  return where
}

const getAll = async () => {
  return tagsRepository.findAll()
}

const getTagsWithCounts = async (filtros: TagsContextFilters) => {
  const inmuebleWhere = buildInmuebleWhereFromFilters(filtros)
  return tagsRepository.findAllWithContextualCounts(inmuebleWhere)
}

const getTagsByPublicacion = async (publicacionId: number) => {
  return tagsRepository.findByPublicacionId(publicacionId)
}

const replacePublicacionTags = async (publicacionId: number, userId: number, nombres: string[]) => {
  const publicacion = await tagsRepository.findPublicacionOwner(publicacionId)

  if (!publicacion) throw new Error('PUBLICATION_NOT_FOUND')
  if (publicacion.usuarioId !== userId) throw new Error('FORBIDDEN')

  const nombresNormalizados = [...new Set(nombres.map((tag) => tag.trim().toLowerCase()))]

  if (nombresNormalizados.length > MAX_TAGS) {
    throw new Error('MAX_TAGS_EXCEEDED')
  }

  const tagIds: number[] = []

  for (const nombre of nombresNormalizados) {
    const tag = await tagsRepository.findOrCreate(nombre)
    tagIds.push(tag.id)
  }

  return tagsRepository.replacePublicacionTags(publicacionId, tagIds)
}

export const tagsService = {
  getAll,
  getTagsWithCounts,
  getTagsByPublicacion,
  replacePublicacionTags
}
