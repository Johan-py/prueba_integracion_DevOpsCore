import { createSession, findUserByCorreo } from "../auth.repository.ts";

export const findUserByGoogleEmail = async (correo: string) => {
  return await findUserByCorreo(correo);
};

export const createGoogleSession = async ({
  token,
  usuarioId,
  fechaExpiracion,
}: {
  token: string;
  usuarioId: number;
  fechaExpiracion: Date;
}) => {
  return await createSession({
    token,
    usuarioId,
    fechaExpiracion,
  });
};
