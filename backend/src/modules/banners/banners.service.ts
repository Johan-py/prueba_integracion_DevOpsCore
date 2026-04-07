import { BannersRepository } from "./banners.repository.ts";

export class BannersService {
  private repository = new BannersRepository();

  async getAllActive() {
    return await this.repository.getActiveBanners();
  }
}
