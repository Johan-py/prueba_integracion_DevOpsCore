import { prisma } from '../../../lib/prisma.client.js' // aqui modifique la ruta de importación para prisma Sigma

// Cupones mock (fallback)
const cuponesMock: Record<
  string,
  { tipo: 'PORCENTAJE' | 'MONTO_FIJO'; valor: number; maxUsos: number; usosActuales: number }
> = {
  DESCUENTO10: { tipo: 'PORCENTAJE', valor: 10, maxUsos: 5, usosActuales: 2 },
  AHORRO20: { tipo: 'PORCENTAJE', valor: 20, maxUsos: 3, usosActuales: 1 },
  BS15: { tipo: 'MONTO_FIJO', valor: 15, maxUsos: 10, usosActuales: 4 }
}

function convertirDecimalANumber(valor: any): number {
  if (!valor) return 0
  if (typeof valor === 'object' && 'toNumber' in valor) return valor.toNumber()
  if (typeof valor === 'number') return valor
  return 0
}

export async function aplicarCupon(transaccionId: number, codigo: string, totalOriginal: number) {
  // 1. Intentar obtener cupón desde DB real
  const cuponDB = await prisma.cupon
    .findUnique({
      where: { codigo: codigo.toUpperCase() }
    })
    .catch(() => null)

  let usandoMock = false
  let cuponValor: number = 0
  let cuponTipo: 'PORCENTAJE' | 'MONTO_FIJO' = 'PORCENTAJE'
  let maxUsos: number = 0
  let usosActuales: number = 0
  let cuponId: number | null = null

  if (cuponDB) {
    cuponValor = convertirDecimalANumber(cuponDB.valor_descuento)
    cuponTipo = cuponDB.tipo_descuento as 'PORCENTAJE' | 'MONTO_FIJO'
    maxUsos = cuponDB.max_usos
    usosActuales = cuponDB.usos_actuales
    cuponId = cuponDB.id
  } else {
    console.warn(`⚠️ Cupón ${codigo} no encontrado en DB, usando mock`)
    const cuponMock = cuponesMock[codigo.toUpperCase()]
    if (!cuponMock) {
      throw new Error('Código inválido')
    }
    usandoMock = true
    cuponValor = cuponMock.valor
    cuponTipo = cuponMock.tipo
    maxUsos = cuponMock.maxUsos
    usosActuales = cuponMock.usosActuales
  }

  // 2. Verificar usos disponibles
  if (!usandoMock && usosActuales >= maxUsos) {
    throw new Error('Cupón agotado')
  }

  // 3. Verificar que no se haya aplicado otro cupón
  if (!usandoMock) {
    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId }
    })
    if (transaccion?.cupon_id) {
      throw new Error('Ya se aplicó un descuento')
    }
  }

  // 4. Calcular descuento
  let montoDescuento = 0
  if (cuponTipo === 'PORCENTAJE') {
    montoDescuento = totalOriginal * (cuponValor / 100)
  } else {
    montoDescuento = cuponValor
    if (montoDescuento > totalOriginal) montoDescuento = totalOriginal
  }
  montoDescuento = Number(montoDescuento.toFixed(2))
  const nuevoTotal = totalOriginal - montoDescuento

  // 5. Actualizar transacción en DB (solo si es real)
  if (!usandoMock && cuponId) {
    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: {
        cupon_id: cuponId,
        monto_descuento: montoDescuento,
        total: nuevoTotal
      }
    })
  }

  return { total: nuevoTotal, montoDescuento }
}
