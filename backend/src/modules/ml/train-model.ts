import { prisma } from "../../lib/prisma.client.js";
import * as fs from "fs";
import * as path from "path";

interface Pesos {
  version: string;
  algoritmo: string;
  pesos: number[];
  bias: number;
  features: string[];
  precision: number;
  recall: number;
  datos_usados: number;
  entrenado_en: string;
}

// === REGRESIÓN LOGÍSTICA ===
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function predecir(x: number[], pesos: number[], bias: number): number {
  const z = x.reduce((sum, xi, i) => sum + xi * pesos[i], bias);
  return sigmoid(z);
}

function entrenarRegresionLogistica(
  X: number[][],
  y: number[],
  learningRate = 0.01,
  epochs = 1000,
): { pesos: number[]; bias: number } {
  const n = X[0].length;
  const pesos = new Array(n).fill(0);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradPesos = new Array(n).fill(0);
    let gradBias = 0;

    for (let i = 0; i < X.length; i++) {
      const pred = predecir(X[i], pesos, bias);
      const error = pred - y[i];

      for (let j = 0; j < n; j++) {
        gradPesos[j] += error * X[i][j];
      }
      gradBias += error;
    }

    for (let j = 0; j < n; j++) {
      pesos[j] -= (learningRate * gradPesos[j]) / X.length;
    }
    bias -= (learningRate * gradBias) / X.length;
  }

  return { pesos, bias };
}

function calcularMetricas(
  X: number[][],
  y: number[],
  pesos: number[],
  bias: number,
): { precision: number; recall: number } {
  let tp = 0,
    fp = 0,
    fn = 0;

  for (let i = 0; i < X.length; i++) {
    const pred = predecir(X[i], pesos, bias) >= 0.5 ? 1 : 0;
    if (pred === 1 && y[i] === 1) tp++;
    else if (pred === 1 && y[i] === 0) fp++;
    else if (pred === 0 && y[i] === 1) fn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  return { precision, recall };
}

// === EXTRAER FEATURES DEL JSON ===
function extraerVector(features: any): number[] {
  const categoriaMap: Record<string, number> = {
    CASA: 1,
    DEPARTAMENTO: 2,
    TERRENO: 3,
    OFICINA: 4,
    CUARTO: 5,
    TERRENO_MORTUORIO: 6,
  };
  const tipoAccionMap: Record<string, number> = {
    VENTA: 1,
    ALQUILER: 2,
    ANTICRETO: 3,
  };

  return [
    (categoriaMap[features.categoria] || 0) / 6,
    (tipoAccionMap[features.tipoAccion] || 0) / 3,
    Math.min((features.precio || 0) / 1_000_000, 1),
    Math.min((features.superficieM2 || 0) / 500, 1),
    Math.min((features.nroCuartos || 0) / 10, 1),
    Math.min((features.nroBanos || 0) / 5, 1),
    features.precioReducido ? 1 : 0,
  ];
}

// === SCRIPT PRINCIPAL ===
async function entrenar() {
  console.log("[TRAIN] Iniciando entrenamiento batch...");

  // 1. Leer registros no usados
  const registros = await prisma.entrenamiento_ml.findMany({
    where: { usado_en_modelo: false },
    orderBy: { fecha_evento: "asc" },
  });

  console.log(`[TRAIN] Registros encontrados: ${registros.length}`);

  if (registros.length < 5) {
    console.log("[TRAIN] Datos insuficientes para entrenar (mínimo 5)");
    await prisma.$disconnect();
    return;
  }

  // 2. Preparar datos
  const X: number[][] = [];
  const y: number[] = [];

  for (const r of registros) {
    if (!r.features) continue;
    const vector = extraerVector(r.features);
    X.push(vector);
    // Label: 1 si score_real >= 0.5 (interacción positiva), 0 si no
    y.push(r.score_real >= 0.5 ? 1 : 0);
  }

  console.log(`[TRAIN] Ejemplos de entrenamiento: ${X.length}`);

  // 3. Entrenar
  const { pesos, bias } = entrenarRegresionLogistica(X, y);
  const { precision, recall } = calcularMetricas(X, y, pesos, bias);

  console.log(`[TRAIN] Precisión: ${(precision * 100).toFixed(1)}%`);
  console.log(`[TRAIN] Recall: ${(recall * 100).toFixed(1)}%`);

  // 4. Guardar pesos en JSON
  const version = `v${Date.now()}`;
  const outputDir = path.resolve("src/ml/modelos");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `modelo_${version}.json`);
  const pesosData: Pesos = {
    version,
    algoritmo: "regresion_logistica",
    pesos,
    bias,
    features: [
      "categoria",
      "tipoAccion",
      "precio",
      "superficieM2",
      "cuartos",
      "banos",
      "precioReducido",
    ],
    precision,
    recall,
    datos_usados: X.length,
    entrenado_en: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(pesosData, null, 2));
  console.log(`[TRAIN] Modelo guardado en: ${outputPath}`);

  // 5. Guardar versión en BD
  await prisma.modelo_version.create({
    data: {
      version,
      archivo_path: outputPath,
      algoritmo: "regresion_logistica",
      precision,
      recall,
      datos_usados: X.length,
      activo: true,
      notas: `Entrenado con ${X.length} registros`,
    },
  });

  // 6. Marcar registros como usados
  await prisma.entrenamiento_ml.updateMany({
    where: { usado_en_modelo: false },
    data: { usado_en_modelo: true, version_modelo: version },
  });

  console.log("[TRAIN] Entrenamiento completado.");
  await prisma.$disconnect();
}

entrenar().catch((err) => {
  console.error("[TRAIN] Error:", err);
  process.exit(1);
});
