import { prisma } from "../../lib/prisma.js";

export const findUser = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
  });
};
