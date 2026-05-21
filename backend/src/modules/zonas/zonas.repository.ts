import { prisma } from "../../lib/prisma.client.js";

export const zonasRepository = {
  async getAll() {
    return prisma.zonaPredefinida.findMany({
      where: { activa: true },
      orderBy: { id: "asc" },
    });
  },
};
