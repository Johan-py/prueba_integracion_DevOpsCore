import { testimoniosRepository } from './testimonios.repository.js'

export const testimoniosService = {
  async listar(ciudad?: string, usuarioId?: number) {
    return testimoniosRepository.findAll({ ciudad, usuarioId })
  },

  async toggleLike(testimonioId: number, usuarioId: number) {
    const testimonio = await testimoniosRepository.findById(testimonioId)

    if (!testimonio || testimonio.eliminado) {
      throw new Error('TESTIMONIO_NOT_FOUND')
    }

    const likeExistente = await testimoniosRepository.findLike(
      testimonioId,
      usuarioId
    )

    if (likeExistente) {
      await testimoniosRepository.deleteLike(likeExistente.id)
    } else {
      await testimoniosRepository.createLike(testimonioId, usuarioId)
    }

    const totalLikes = await testimoniosRepository.countLikes(testimonioId)

    return { meGusta: !likeExistente, totalLikes }
  }
}