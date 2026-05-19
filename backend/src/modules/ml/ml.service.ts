import { prisma } from '../../lib/prisma.client.js'
import { recargarModelo } from './model-loader.js'
import * as fs from 'fs'
import * as path from 'path'

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

function predecir(x: number[], pesos: number[], bias: number): number {
  return sigmoid(x.reduce((sum, xi, i) => sum + xi * pesos[i], bias))
}

function entrenar(X: number[][], y: number[]) {
  const n = X[0].length
  const pesos = new Array(n).fill(0)
  let bias = 0
  for (let epoch = 0; epoch < 1000; epoch++) {
    const gradPesos = new Array(n).fill(0)
    let gradBias = 0
    for (let i = 0; i < X.length; i++) {
      const error = predecir(X[i], pesos, bias) - y[i]
      for (let j = 0; j < n; j++) gradPesos[j] += error * X[i][j]
      gradBias += error
    }
    for (let j = 0; j < n; j++) pesos[j] -= (0.01 * gradPesos[j]) / X.length
    bias -= (0.01 * gradBias) / X.length
  }
  return { pesos, bias }
}

function metricas(X: number[][], y: number[], pesos: number[], bias: number) {
  let tp = 0, fp = 0, fn = 0
  for (let i = 0; i < X.length; i++) {
    const pred = predecir(X[i], pesos, bias) >= 0.5 ? 1 : 0
    if (pred === 1 && y[i] === 1) tp++
    else if (pred === 1 && y[i] === 0) fp++
    else if (pred === 0 && y[i] === 1) fn++
  }
  return {
    precision: tp + fp > 0 ? tp / (tp + fp) : 0,
    recall: tp + fn > 0 ? tp / (tp + fn) : 0
  }
}

function extraerVector(features: any): number[] {
  const categoriaMap: Record<string, number> = {
    CASA: 1, DEPARTAMENTO: 2, TERRENO: 3,
    OFICINA: 4, CUARTO: 5, TERRENO_MORTUORIO: 6
  }
  const tipoAccionMap: Record<string, number> = {
    VENTA: 1, ALQUILER: 2, ANTICRETO: 3
  }
  return [
    (categoriaMap[features.categoria] || 0) / 6,
    (tipoAccionMap[features.tipoAccion] || 0) / 3,
    Math.min((features.precio || 0) / 1_000_000, 1),
    Math.min((features.superficieM2 || 0) / 500, 1),
    Math.min((features.nroCuartos || 0) / 10, 1),
    Math.min((features.nroBanos || 0) / 5, 1),
    features.precioReducido ? 1 : 0
  ]
}

export async function ejecutarEntrenamientoManual() {
  const registros = await prisma.entrenamiento_ml.findMany({
    where: { usado_en_modelo: false }
  })

  if (registros.length < 5) {
    return {
      entrenado: false,
      mensaje: `Datos insuficientes: ${registros.length} registros (mínimo 5)`
    }
  }

  const X: number[][] = []
  const y: number[] = []
  for (const r of registros) {
    if (!r.features) continue
    X.push(extraerVector(r.features))
    y.push(r.score_real >= 0.5 ? 1 : 0)
  }

  const { pesos, bias } = entrenar(X, y)
  const { precision, recall } = metricas(X, y, pesos, bias)
  const version = `v${Date.now()}`

  const outputDir = path.resolve('src/ml/modelos')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, `modelo_${version}.json`)
  fs.writeFileSync(outputPath, JSON.stringify({
    version, algoritmo: 'regresion_logistica',
    pesos, bias, precision, recall,
    datos_usados: X.length,
    entrenado_en: new Date().toISOString()
  }, null, 2))

  await prisma.modelo_version.updateMany({
    where: { activo: true },
    data: { activo: false }
  })

  await prisma.modelo_version.create({
    data: {
      version, archivo_path: outputPath,
      algoritmo: 'regresion_logistica',
      precision, recall,
      datos_usados: X.length,
      activo: true,
      notas: `Entrenado manualmente con ${X.length} registros`
    }
  })

  await prisma.entrenamiento_ml.updateMany({
    where: { usado_en_modelo: false },
    data: { usado_en_modelo: true, version_modelo: version }
  })

  recargarModelo({
  version,
  pesos,
  bias,
  precision,
  recall,
  cargadoEn: new Date().toISOString()
})

  return {
    entrenado: true,
    version,
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    datos_usados: X.length
  }
}