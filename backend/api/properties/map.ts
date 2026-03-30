import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPropertiesMapService } from '../../src/modules/properties/properties.service.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await getPropertiesMapService()
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
