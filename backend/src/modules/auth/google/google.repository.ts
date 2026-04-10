import { RolNombre } from "@prisma/client";
import { prisma } from "../../../lib/prisma.config.js";
import { createSession, findUserByCorreo } from "../auth.repository.js";

const ensureVisitorRole = async () => {
  return await prisma.rol.upsert({
    where: { nombre: RolNombre.VISITANTE },
    update: {},
    create: { nombre: RolNombre.VISITANTE },
  });
};

export const findUserByGoogleEmail = async (correo: string) => {
  return await findUserByCorreo(correo)
}

export const createGoogleUser = async ({
  nombre,
  apellido,
  correo,
  password,
}: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}) => {
  const rol = await ensureVisitorRole();

  return await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      correo,
      password,
      rolId: rol.id,
    },
  });
};

export const createGoogleSession = async ({
  token,
  usuarioId,
  fechaExpiracion
}: {
  token: string
  usuarioId: number
  fechaExpiracion: Date
}) => {
  return await createSession({
    token,
    usuarioId,
    fechaExpiracion
  })
}
