import type { VercelRequest, VercelResponse } from '@vercel/node'
import { LocationsService } from '../../src/modules/locations/locations.service.js'

const locationsService = new LocationsService()

export default async function locationSearchHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = req.query.q as string
    const locations = await locationsService.searchLocations(query)

    return res.status(200).json(locations)
  } catch (error) {
    console.error('Error en Location Controller:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
