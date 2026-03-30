import { Request, Response } from 'express'
import { FiltersHomepageService } from './filtershomepage.service.js'

export class FiltersHomepageController {
  private service = new FiltersHomepageService()

  getFilters = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getHomeFilters()
      res.json({ success: true, data })
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Error al obtener filtros' })
    }
  }
}
