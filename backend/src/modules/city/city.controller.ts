import type { Request, Response } from "express"

import { CityService } from "./city.service.js"

export class CityController {
  private service = new CityService()

  async getFeatured(req: Request, res: Response) {
    try {
      const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined
      const limit = rawLimit && Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined

      const cities = await this.service.getFeatured(limit)

      return res.json(cities)
    } catch (error) {
      console.error("Error obteniendo ciudades destacadas:", error)
      return res.status(500).json({ error: "No se pudieron obtener las ciudades destacadas" })
    }
  }
}
