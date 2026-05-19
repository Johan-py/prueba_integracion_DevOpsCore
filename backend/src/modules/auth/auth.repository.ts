import { RolNombre } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";

interface CreateUserInput {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono?: string;
}

type PrismaLikeKnownError = {
  code?: string;
  meta?: {
    target?: unknown;
  };
  message?: string;
};

const ensureVisitorRole = async () => {
  return await prisma.rol.upsert({
    where: { nombre: RolNombre.VISITANTE },
    update: {},
    create: { nombre: RolNombre.VISITANTE },
  });
};

const isUniqueConstraintError = (
  error: unknown,
): error is PrismaLikeKnownError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaLikeKnownError).code === "P2002"
  );
};

const getUniqueConstraintMessage = (error: PrismaLikeKnownError) => {
  const rawTarget = error.meta?.target;
  const targets = Array.isArray(rawTarget) ? rawTarget.map(String) : [];
  const searchableText =
    `${targets.join(" ")} ${error.message ?? ""}`.toLowerCase();

  if (searchableText.includes("correo")) {
    return "El correo ya está registrado";
  }

  return "Ya existe un registro con esos datos";
};

export const createUser = async (data: CreateUserInput) => {
  const rol = await ensureVisitorRole();

  try {
    return await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        password: data.password,
        rolId: rol.id,
        telefonos: data.telefono
          ? {
              create: {
                codigoPais: "+591",
                numero: data.telefono,
                principal: true,
              },
            }
          : undefined,
      },
      include: {
        telefonos: true,
        rol: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(getUniqueConstraintMessage(error));
    }

    throw error;
  }
};

// Incluye el campo `activo` para que loginService pueda verificar si la cuenta está desactivada
export const findUser = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
    select: {
      id: true,
      correo: true,
      password: true,
      nombre: true,
      apellido: true,
      avatar: true,
      activo: true,
      two_factor_activo: true,
      controlador: true,
      rol: true,
    },
  });
};
export const findUserByCorreo = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
    include: {
      rol: true,
    },
  });
};

export const findUserById = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      rol: true,
    },
  });
};

export const createSession = async ({
  token,
  usuarioId,
  fechaExpiracion,
  metodo_auth,
}: {
  token: string;
  usuarioId: number;
  fechaExpiracion: Date;
  metodo_auth?: string;
}) => {
  return await prisma.sesion.create({
    data: {
      token,
      usuarioId,
      fechaExpiracion,
      estado: true,
      metodo_auth: metodo_auth ?? "email",
    },
  });
};

export const findActiveSessionByToken = async (token: string) => {
  return await prisma.sesion.findFirst({
    where: {
      token,
      estado: true,
      fechaExpiracion: {
        gt: new Date(),
      },
    },
    include: {
      usuario: {
        include: {
          rol: true,
        },
      },
    },
  });
};

export const desactiveSessionByToken = async (token: string) => {
  return await prisma.sesion.updateMany({
    where: {
      token,
      estado: true,
    },
    data: {
      estado: false,
    },
  });
};

export const invalidateActive2FACodesByUserId = async (usuarioId: number) => {
  return await prisma.codigo_2fa.updateMany({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null,
    },
    data: {
      activo: false,
    },
  });
};

export const create2FACode = async ({
  usuarioId,
  codigoHash,
  expiraEn,
}: {
  usuarioId: number;
  codigoHash: string;
  expiraEn: Date;
}) => {
  return await prisma.codigo_2fa.create({
    data: {
      usuarioId,
      codigoHash,
      expiraEn,
      intentos: 0,
      activo: true,
    },
  });
};
export const desactivarRecuperacionesPasswordActivas = async (
  usuarioId: number,
) => {
  return prisma.recuperacion_password.updateMany({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null,
    },
    data: {
      activo: false,
    },
  });
};

export const createPasswordRecovery = async ({
  usuarioId,
  token,
  expiraEn,
}: {
  usuarioId: number;
  token: string;
  expiraEn: Date;
}) => {
  return prisma.recuperacion_password.create({
    data: {
      usuarioId,
      token,
      expiraEn,
      activo: true,
    },
  });
};

export const findPasswordRecoveryByToken = async (token: string) => {
  return prisma.recuperacion_password.findUnique({
    where: { token },
    include: { usuario: true },
  });
};

export const markPasswordRecoveryAsUsed = async (id: number) => {
  return prisma.recuperacion_password.update({
    where: { id },
    data: { usadoEn: new Date(), activo: false },
  });
};

export const findActive2FACodeByUserId = async (usuarioId: number) => {
  return await prisma.codigo_2fa.findFirst({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null,
    },
    orderBy: {
      creadoEn: "desc",
    },
  });
};

export const findAny2FACodeByUserIdAndHash = async (
  usuarioId: number,
  codigoHash: string,
) => {
  return await prisma.codigo_2fa.findFirst({
    where: {
      usuarioId,
      codigoHash,
    },
    orderBy: {
      creadoEn: "desc",
    },
  });
};

export const mark2FACodeAsUsed = async (id: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      usadoEn: new Date(),
      activo: false,
    },
  });
};

export const increment2FACodeAttempts = async (
  id: number,
  intentosActuales: number,
) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      intentos: intentosActuales + 1,
    },
  });
};

export const expire2FACode = async (id: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      activo: false,
    },
  });
};

export const activate2FAByUserId = async (userId: number) => {
  return await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: true,
      two_factor_activado_en: new Date(),
      two_factor_metodo: "email",
    },
  });
};

export const deactivate2FAByUserId = async (userId: number) => {
  return await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: false,
    },
  });
};

export const findUserByActiveSessionTokenForSocialLink = async (
  token: string,
) => {
  return await prisma.sesion.findFirst({
    where: {
      token,
      estado: true,
      fechaExpiracion: {
        gt: new Date(),
      },
    },
    include: {
      usuario: {
        select: {
          id: true,
          correo: true,
          nombre: true,
          apellido: true,
        },
      },
    },
  });
};

export const findSocialLinkByProviderAndExternalId = async (
  proveedor: string,
  idExterno: string,
) => {
  return await prisma.autenticacion_social.findFirst({
    where: {
      proveedor,
      idExterno,
      activo: true,
    },
  });
};

export const findSocialLinkByUserAndProvider = async (
  usuarioId: number,
  proveedor: string,
) => {
  return await prisma.autenticacion_social.findFirst({
    where: {
      usuarioId,
      proveedor,
      activo: true,
    },
  });
};

export const createSocialLink = async ({
  usuarioId,
  proveedor,
  idExterno,
  correoProveedor,
}: {
  usuarioId: number;
  proveedor: string;
  idExterno: string;
  correoProveedor?: string | null;
}) => {
  const existingLink = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor,
      idExterno,
    },
  });

  if (existingLink) {
    return await prisma.autenticacion_social.update({
      where: {
        id: existingLink.id,
      },
      data: {
        usuarioId,
        correoProveedor: correoProveedor ?? null,
        activo: true,
        vinculadoEn: new Date(),
        ultimo_uso_en: new Date(),
      },
    });
  }

  return await prisma.autenticacion_social.create({
    data: {
      usuarioId,
      proveedor,
      idExterno,
      correoProveedor: correoProveedor ?? null,
      activo: true,
      vinculadoEn: new Date(),
      ultimo_uso_en: new Date(),
    },
  });
};

export const deactivateSocialLinkByUserAndProvider = async (
  usuarioId: number,
  proveedor: string,
) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuarioId,
      proveedor,
      activo: true,
    },
    data: {
      activo: false,
    },
  });
};

export const listSocialLinksByUser = async (usuarioId: number) => {
  return await prisma.autenticacion_social.findMany({
    where: {
      usuarioId,
      activo: true,
      proveedor: {
        in: ["facebook", "discord", "google", "linkedin"],
      },
    },
    select: {
      proveedor: true,
      correoProveedor: true,
      idExterno: true,
      vinculadoEn: true,
      token_expira_en: true,
    },
  });
};

export const updateUserPassword = async (
  usuarioId: number,
  password: string,
) => {
  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { password },
  });
};

export const invalidateAllUserSessions = async (usuarioId: number) => {
  return prisma.sesion.updateMany({
    where: { usuarioId, estado: true },
    data: { estado: false },
  });
};

export const invalidateOtherUserSessions = async (
  usuarioId: number,
  currentToken: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuarioId,
      token: { not: currentToken },
      estado: true,
    },
    data: { estado: false },
  });
};
export const completeTourByUserId = async (id: number) => {
  return await prisma.usuario.update({
    where: { id },
    data: { controlador: true },
  });
};

export const activateUser = async (id: number) => {
  return await prisma.usuario.update({
    where: { id },
    data: {
      activo: true,
      desactivado_en: null,
    },
  });
};

export const countActiveSocialLinksByUser = async (usuarioId: number) => {
  return await prisma.autenticacion_social.count({
    where: {
      usuarioId,
      activo: true,
      proveedor: {
        in: ["facebook", "discord", "google", "linkedin"],
      },
    },
  });
};

export const invalidateSessionsByAuthMethod = async (
  usuarioId: number,
  metodo_auth: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuarioId,
      metodo_auth,
      estado: true,
    },
    data: {
      estado: false,
    },
  });
};

export const invalidateActiveMagicLinksByUserId = async (usuarioId: number) => {
  return await prisma.$executeRaw`
    UPDATE magic_link
    SET
      activo = false,
      invalidado_en = NOW(),
      ultimo_reenvio_en = NOW()
    WHERE usuario_id = ${usuarioId}
      AND activo = true
      AND usado_en IS NULL
      AND invalidado_en IS NULL
  `;
};

type ServerTimeRow = {
  now: Date;
};

export const getServerTime = async () => {
  const rows = await prisma.$queryRaw<ServerTimeRow[]>`
    SELECT NOW() AS now
  `;

  return rows[0]?.now ?? new Date();
};

export const createMagicLink = async ({
  usuarioId,
  tokenHash,
  correo,
  expiraEn,
}: {
  usuarioId: number;
  tokenHash: string;
  correo: string;
  expiraEn: Date;
}) => {
  return await prisma.magic_link.create({
    data: {
      usuario_id: usuarioId,
      token_hash: tokenHash,
      correo,
      expira_en: expiraEn,
      activo: true,
      intentos_reenvio: 0,
    },
  });
};

type MagicLinkRecord = {
  id: number;
  usuario_id: number;
  token_hash: string;
  correo: string;
  expira_en: Date;
  usado_en: Date | null;
  activo: boolean | null;
  invalidado_en: Date | null;
};

export const findMagicLinkByTokenHash = async (tokenHash: string) => {
  const rows = await prisma.$queryRaw<MagicLinkRecord[]>`
    SELECT
      id,
      usuario_id,
      token_hash,
      correo,
      expira_en,
      usado_en,
      activo,
      invalidado_en
    FROM magic_link
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `;

  return rows[0] ?? null;
};

export const markMagicLinkAsUsed = async (id: number) => {
  const affectedRows = await prisma.$executeRaw`
    UPDATE magic_link
    SET
      usado_en = NOW(),
      activo = false
    WHERE id = ${id}
      AND activo = true
      AND usado_en IS NULL
      AND invalidado_en IS NULL
  `;

  return affectedRows > 0;
};

export const deactivateMagicLink = async (id: number) => {
  return await prisma.$executeRaw`
    UPDATE magic_link
    SET activo = false
    WHERE id = ${id}
  `;
};

export const invalidateOtherSessionsByAuthMethod = async (
  usuarioId: number,
  metodo_auth: string,
  currentToken: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuarioId,
      metodo_auth,
      estado: true,
      token: {
        not: currentToken,
      },
    },
    data: {
      estado: false,
    },
  });
};
