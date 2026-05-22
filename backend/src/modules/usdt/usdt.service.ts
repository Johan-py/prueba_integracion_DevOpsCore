const BOB_PER_USDT = parseFloat(process.env.BOB_PER_USDT ?? '6.91')

export const getExchangeRate = () => ({
  bob_per_usdt: BOB_PER_USDT,
  red: 'Shasta Testnet',
  token: 'USDT (TRC20)',
})

export const convertirBobAUsdt = (bob: number): number =>
  parseFloat((bob / BOB_PER_USDT).toFixed(6))

export const verificarTransaccionShasta = async (
  txHash: string
): Promise<{ valida: boolean; confirmaciones: number; mensaje: string }> => {
  const baseUrl = process.env.TRON_GRID_URL ?? 'https://api.shasta.trongrid.io'

  try {
    const res = await fetch(`${baseUrl}/v1/transactions/${txHash}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return { valida: false, confirmaciones: 0, mensaje: 'Transacción no encontrada en la red' }
    }

    const data = (await res.json()) as { data?: { ret?: { contractRet?: string }[]; blockNumber?: number }[] }
    const tx = data?.data?.[0]

    if (!tx) {
      return { valida: false, confirmaciones: 0, mensaje: 'Hash de transacción no encontrado' }
    }

    const exitosa = tx.ret?.[0]?.contractRet === 'SUCCESS'

    if (!exitosa) {
      return { valida: false, confirmaciones: 0, mensaje: 'Transacción no exitosa o pendiente de confirmación' }
    }

    return {
      valida: true,
      confirmaciones: tx.blockNumber ? 20 : 1,
      mensaje: 'Transacción verificada en red Tron. Suscripción activada.',
    }
  } catch {
    return { valida: false, confirmaciones: 0, mensaje: 'Error al conectar con la red Tron' }
  }
}
