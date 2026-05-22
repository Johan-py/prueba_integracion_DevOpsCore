import { prisma } from "../../lib/prisma.client.js";

export type SecurityUserPasswordRecord = {
  id: number;
  password: string | null;
  two_factor_activo: boolean;
};

export const findUserPasswordByIdRepository = async (
  userId: number,
): Promise<SecurityUserPasswordRecord | null> => {
  return await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      two_factor_activo: true,
    },
  });
};

export type SecurityUserRecord = {
  id: number;
  password: string | null;
  correo: string;
  nombre: string;
};
//prueba

export const findSecurityUserByIdRepository = async (
  userId: number,
): Promise<SecurityUserRecord | null> => {
  return await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      correo: true,
      nombre: true,
    },
  });
};

export const deactivateUserAccountRepository = async (
  userId: number,
): Promise<void> => {
  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: userId },
      data: {
        activo: false,
        desactivado_en: new Date(),
      },
    }),
    prisma.sesion.updateMany({
      where: {
        usuarioId: userId,
        estado: true,
      },
      data: {
        estado: false,
      },
    }),
  ]);
};

export const findUserGoogleAuthRepository = async (
  userId: number,
): Promise<boolean> => {
  const socialAuth = await prisma.autenticacion_social.findFirst({
    where: {
      usuarioId: userId,
      proveedor: "google",
      activo: true,
    },
  });
  return Boolean(socialAuth);
};
