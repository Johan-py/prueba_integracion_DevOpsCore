import { testimoniosRepository } from './testimonios.repository.js'

export const testimoniosService = {
  async listar(ciudad?: string, usuario_id?: number) {
    return testimoniosRepository.findAll({ ciudad, usuario_id })
  },

  async toggleLike(testimonioId: number, usuario_id: number) {
    const testimonio = await testimoniosRepository.findById(testimonioId)

    if (!testimonio || testimonio.eliminado) {
      throw new Error('TESTIMONIO_NOT_FOUND')
    }

    const likeExistente = await testimoniosRepository.findLike(
      testimonioId,
      usuario_id
    )

    if (likeExistente) {
      await testimoniosRepository.deleteLike(likeExistente.id)
    } else {
      await testimoniosRepository.createLike(testimonioId, usuario_id)
    }

    const totalLikes = await testimoniosRepository.countLikes(testimonioId)

    return { meGusta: !likeExistente, totalLikes }
  }
}
