import { PrismaClient } from '@prisma/client'

// Crear cliente lazily cuando se necesite
async function getPrismaClient(): Promise<PrismaClient> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida')
  }

  try {
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    })

    // Test de conexión
    await prisma.$connect()
    console.log('✓ Conexión a Prisma exitosa')
    return prisma
  } catch (error) {
    console.error('✗ Error conectando a Prisma:', error)
    throw error
  }
}

export const propertiesRepository = {
  async search(filtros: any) {
    const prisma = await getPrismaClient()

    try {
      const whereClause: any = {}

      if (filtros.categoria) {
        const categorias = Array.isArray(filtros.categoria)
          ? filtros.categoria
          : [filtros.categoria]

        const categoriasValidas = categorias
          .filter((c: string) =>
            ['CASA', 'DEPARTAMENTO', 'TERRENO', 'OFICINA'].includes(c.toUpperCase())
          )
          .map((c: string) => c.toUpperCase())

        if (categoriasValidas.length > 0) {
          whereClause.categoria = {
            in: categoriasValidas
          }
        }
      }

      if (filtros.tipoAccion) {
        const tipoUpper = filtros.tipoAccion.toUpperCase()
        if (['VENTA', 'ALQUILER', 'ANTICRETO'].includes(tipoUpper)) {
          whereClause.tipoAccion = tipoUpper
        }
      }

      whereClause.estado = 'ACTIVO'

      console.log('🔍 Buscando propiedades con filtros:', whereClause)

      const properties = await prisma.inmueble.findMany({
        where: whereClause,
        include: {
          ubicacion: true
        },
        orderBy: {
          fechaPublicacion: 'desc'
        }
      })

      console.log(`✓ Se encontraron ${properties.length} propiedades`)
      return properties
    } finally {
      await prisma.$disconnect()
    }
  }
}
