// modules/auth/auth.repository.ts
import { prisma } from "../../lib/prisma.client.js";

// ─── USUARIO ───────────────────────────────────────────
export const findUser = async (correo: string) => {
  return prisma.usuario.findFirst({
    where: { correo },
    include: { rol: true },
  });
};

export const findUserById = async (id: number) => {
  return prisma.usuario.findUnique({
    where: { id },
    include: { rol: true },
  });
};

export const findUserByCorreo = async (correo: string) => {
  return prisma.usuario.findUnique({
    where: { correo },
    include: { rol: true },
  });
};

export const createUser = async (data: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono?: string;
}) => {
  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      ...(data.telefono && {
        telefonos: {
          create: [{ numero: data.telefono, codigoPais: "" }],
        },
      }),
    },
    include: { telefonos: true, rol: true },
  });
};

// ─── SESIÓN ────────────────────────────────────────────
export const createSession = async (data: {
  token: string;
  usuario_id: number;
  fecha_expiracion: Date;
}) => {
  return prisma.sesion.create({ data });
};

export const findActiveSessionByToken = async (token: string) => {
  return prisma.sesion.findFirst({
    where: { token, estado: true },
    include: { usuario: { include: { rol: true } } },
  });
};

export const desactiveSessionByToken = async (token: string) => {
  return prisma.sesion.updateMany({
    where: { token },
    data: { estado: false },
  });
};

// ─── RECUPERACIÓN DE PASSWORD ──────────────────────────
export const createPasswordRecovery = async (data: {
  usuario_id: number;
  token: string;
  expira_en: Date;
}) => {
  return prisma.recuperacion_password.create({ data });
};

export const findPasswordRecoveryByToken = async (token: string) => {
  return prisma.recuperacion_password.findFirst({ where: { token } });
};

export const markPasswordRecoveryAsUsed = async (id: number) => {
  return prisma.recuperacion_password.update({
    where: { id },
    data: { usado_en: new Date(), activo: false },
  });
};

export const desactivarRecuperacionesPasswordActivas = async (
  usuario_id: number,
) => {
  return prisma.recuperacion_password.updateMany({
    where: { usuario_id, activo: true },
    data: { activo: false },
  });
};

// ─── 2FA ───────────────────────────────────────────────
export const create2FACode = async (data: {
  usuario_id: number;
  codigo_hash: string;
  expira_en: Date;
}) => {
  return prisma.codigo_2fa.create({ data });
};

export const findActive2FACodeByUserId = async (usuario_id: number) => {
  return prisma.codigo_2fa.findFirst({
    where: { usuario_id, usado_en: null },
    orderBy: { creado_en: "desc" },
  });
};

export const invalidateActive2FACodesByUserId = async (usuario_id: number) => {
  return prisma.codigo_2fa.updateMany({
    where: { usuario_id, usado_en: null },
    data: { usado_en: new Date() },
  });
};

export const expire2FACode = async (id: number) => {
  return prisma.codigo_2fa.update({
    where: { id },
    data: { usado_en: new Date() },
  });
};

export const increment2FACodeAttempts = async (
  id: number,
  intentosActuales: number,
) => {
  return prisma.codigo_2fa.update({
    where: { id },
    data: { intentos: intentosActuales + 1 },
  });
};

export const mark2FACodeAsUsed = async (id: number) => {
  return prisma.codigo_2fa.update({
    where: { id },
    data: { usado_en: new Date() },
  });
};

export const activate2FAByUserId = async (id: number) => {
  return prisma.usuario.update({
    where: { id },
    data: { two_factor_activo: true },
  });
};

export const deactivate2FAByUserId = async (id: number) => {
  return prisma.usuario.update({
    where: { id },
    data: { two_factor_activo: false },
  });
};

