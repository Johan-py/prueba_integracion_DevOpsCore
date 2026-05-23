import { prisma } from "../../lib/prisma.client.js";

export const zonasRepository = {
  async getAll() {
    return prisma.zona_predefinida.findMany({
      where: { activa: true },
      orderBy: { id: "asc" },
    });
  },
};
