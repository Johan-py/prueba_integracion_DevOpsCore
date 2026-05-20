import { prisma } from '../../lib/prisma.client.js'
import * as fs from 'fs'

interface ModeloEnMemoria {
  version: string
  pesos: number[]
  bias: number
  precision: number
  recall: number
  cargadoEn: string
}

// Modelo en memoria global
let modeloActivo: ModeloEnMemoria | null = null

export function getModeloActivo(): ModeloEnMemoria | null {
  return modeloActivo
}

export async function cargarModeloActivo(): Promise<void> {
  try {
    console.log('[MODEL-LOADER] Buscando modelo activo...')

    const modeloVersion = await prisma.modelo_version.findFirst({
      where: { activo: true }
    })

    if (!modeloVersion) {
      console.log('[MODEL-LOADER] No hay modelo activo — se usará algoritmo de coseno')
      return
    }

    if (!fs.existsSync(modeloVersion.archivo_path)) {
      console.log(`[MODEL-LOADER] Archivo no encontrado: ${modeloVersion.archivo_path}`)
      return
    }

    const contenido = fs.readFileSync(modeloVersion.archivo_path, 'utf-8')
    const datos = JSON.parse(contenido)

    modeloActivo = {
      version: datos.version,
      pesos: datos.pesos,
      bias: datos.bias,
      precision: datos.precision,
      recall: datos.recall,
      cargadoEn: new Date().toISOString()
    }

    console.log(`[MODEL-LOADER] Modelo ${modeloActivo.version} cargado en memoria`)
    console.log(`[MODEL-LOADER] Precisión: ${(modeloActivo.precision * 100).toFixed(1)}% | Recall: ${(modeloActivo.recall * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('[MODEL-LOADER] Error al cargar modelo:', error)
  }
}

export function recargarModelo(datos: ModeloEnMemoria): void {
  modeloActivo = { ...datos, cargadoEn: new Date().toISOString() }
  console.log(`[MODEL-LOADER] Modelo ${modeloActivo.version} recargado en memoria`)
}