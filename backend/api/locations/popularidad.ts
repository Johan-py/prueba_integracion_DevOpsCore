import { LocationsService } from '../../src/modules/locations/locations.service.js'

const locationsService = new LocationsService()
const popularidadHandler = async (req: any, res: any) => {
  // 1. Validar el método (solo permitimos POST desde tu Hook)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  try {
    const { id } = req.body

    // Validar que el ID llegó desde el frontend
    if (!id) {
      return res.status(400).json({ error: 'ID de ubicación requerido' })
    }

    // Ejecutar la lógica de la HU 2 (Incrementar en Supabase)
    // Convertimos a Number porque Prisma espera un entero para el ID
    const actualizado = await locationsService.incrementPopularity(Number(id))

    return res.status(200).json({
      success: true,
      id: actualizado.id,
      nuevaPopularidad: actualizado.popularidad
    })
  } catch (error: any) {
    console.error('[DATABASE_ERROR] Error al subir popularidad:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    })
  }
}

//EXPORTACIÓN CLAVE PARA QUE EL SERVIDOR PUEDA USAR ESTE HANDLER
export default popularidadHandler
