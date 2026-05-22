import type { Request, Response } from 'express'

const PRECIOS_BASE = { 1: 0, 2: 99, 3: 199 }

export const calcularPrecio = async (req: Request, res: Response) => {
  try {
    const { planId, tipo } = req.body

    if (!planId || !tipo) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    const precioBase = PRECIOS_BASE[planId as keyof typeof PRECIOS_BASE]
    if (precioBase === undefined) {
      return res.status(404).json({ error: 'Plan no encontrado' })
    }

    let montoBruto = 0,
      descuento = 0,
      montoNeto = 0

    if (tipo === 'mensual') {
      montoBruto = precioBase
      montoNeto = precioBase
    } else if (tipo === 'anual') {
      montoBruto = precioBase * 12
      descuento = montoBruto * 0.1
      montoNeto = montoBruto - descuento
    } else {
      return res.status(400).json({ error: 'Tipo inválido' })
    }

    if (montoNeto < 0) {
      return res.status(400).json({ error: 'Error de cálculo, total no válido' })
    }

    res.json({ planId, tipo, precioBase, montoBruto, descuento, montoNeto, moneda: 'Bs.' })
  } catch {
    res.status(500).json({ error: 'Error del servidor' })
  }
}
