import { Request, Response } from 'express'
import { BannersService } from './banners.service.js'

export class BannersController {
  private service = new BannersService()

  async getBanners(req: Request, res: Response) {
    try {
      const banners = await this.service.getAllActive()
      return res.json(banners)
    } catch (_error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
