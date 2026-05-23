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
  usuario_id,
  fecha_expiracion,
  metodo_auth,
}: {
  token: string;
  usuario_id: number;
  fecha_expiracion: Date;
  metodo_auth?: string;
}) => {
  return await prisma.sesion.create({
    data: {
      token,
      usuario_id,
      fecha_expiracion,
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
      fecha_expiracion: {
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

export const invalidateActive2FACodesByUserId = async (usuario_id: number) => {
  return await prisma.codigo_2fa.updateMany({
    where: {
      usuario_id,
      activo: true,
      usado_en: null,
    },
    data: {
      activo: false,
    },
  });
};

export const create2FACode = async ({
  usuario_id,
  codigo_hash,
  expira_en,
}: {
  usuario_id: number;
  codigo_hash: string;
  expira_en: Date;
}) => {
  return await prisma.codigo_2fa.create({
    data: {
      usuario_id,
      codigo_hash,
      expira_en,
      intentos: 0,
      activo: true,
    },
  });
};
export const desactivarRecuperacionesPasswordActivas = async (
  usuario_id: number,
) => {
  return prisma.recuperacion_password.updateMany({
    where: {
      usuario_id,
      activo: true,
      usado_en: null,
    },
    data: {
      activo: false,
    },
  });
};

export const createPasswordRecovery = async ({
  usuario_id,
  token,
  expira_en,
}: {
  usuario_id: number;
  token: string;
  expira_en: Date;
}) => {
  return prisma.recuperacion_password.create({
    data: {
      usuario_id,
      token,
      expira_en,
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
    data: { usado_en: new Date(), activo: false },
  });
};

export const findActive2FACodeByUserId = async (usuario_id: number) => {
  return await prisma.codigo_2fa.findFirst({
    where: {
      usuario_id,
      activo: true,
      usado_en: null,
    },
    orderBy: {
      creado_en: "desc",
    },
  });
};

export const findAny2FACodeByUserIdAndHash = async (
  usuario_id: number,
  codigo_hash: string,
) => {
  return await prisma.codigo_2fa.findFirst({
    where: {
      usuario_id,
      codigo_hash,
    },
    orderBy: {
      creado_en: "desc",
    },
  });
};

export const mark2FACodeAsUsed = async (id: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      usado_en: new Date(),
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
      fecha_expiracion: {
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
  id_externo: string,
) => {
  return await prisma.autenticacion_social.findFirst({
    where: {
      proveedor,
      id_externo,
      activo: true,
    },
  });
};

export const findSocialLinkByUserAndProvider = async (
  usuario_id: number,
  proveedor: string,
) => {
  return await prisma.autenticacion_social.findFirst({
    where: {
      usuario_id,
      proveedor,
      activo: true,
    },
  });
};

export const createSocialLink = async ({
  usuario_id,
  proveedor,
  id_externo,
  correo_proveedor,
}: {
  usuario_id: number;
  proveedor: string;
  id_externo: string;
  correo_proveedor?: string | null;
}) => {
  const existingLink = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor,
      id_externo,
    },
  });

  if (existingLink) {
    return await prisma.autenticacion_social.update({
      where: {
        id: existingLink.id,
      },
      data: {
        usuario_id,
        correo_proveedor: correo_proveedor ?? null,
        activo: true,
        vinculado_en: new Date(),
        ultimo_uso_en: new Date(),
      },
    });
  }

  return await prisma.autenticacion_social.create({
    data: {
      usuario_id,
      proveedor,
      id_externo,
      correo_proveedor: correo_proveedor ?? null,
      activo: true,
      vinculado_en: new Date(),
      ultimo_uso_en: new Date(),
    },
  });
};

export const deactivateSocialLinkByUserAndProvider = async (
  usuario_id: number,
  proveedor: string,
) => {
  return await prisma.autenticacion_social.updateMany({
    where: {
      usuario_id,
      proveedor,
      activo: true,
    },
    data: {
      activo: false,
    },
  });
};

export const listSocialLinksByUser = async (usuario_id: number) => {
  return await prisma.autenticacion_social.findMany({
    where: {
      usuario_id,
      activo: true,
      proveedor: {
        in: ["facebook", "discord", "google", "linkedin"],
      },
    },
    select: {
      proveedor: true,
      correo_proveedor: true,
      id_externo: true,
      vinculado_en: true,
      token_expira_en: true,
    },
  });
};

export const updateUserPassword = async (
  usuario_id: number,
  password: string,
) => {
  return prisma.usuario.update({
    where: { id: usuario_id },
    data: { password },
  });
};

export const invalidateAllUserSessions = async (usuario_id: number) => {
  return prisma.sesion.updateMany({
    where: { usuario_id, estado: true },
    data: { estado: false },
  });
};

export const invalidateOtherUserSessions = async (
  usuario_id: number,
  currentToken: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuario_id,
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

export const countActiveSocialLinksByUser = async (usuario_id: number) => {
  return await prisma.autenticacion_social.count({
    where: {
      usuario_id,
      activo: true,
      proveedor: {
        in: ["facebook", "discord", "google", "linkedin"],
      },
    },
  });
};

export const invalidateSessionsByAuthMethod = async (
  usuario_id: number,
  metodo_auth: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuario_id,
      metodo_auth,
      estado: true,
    },
    data: {
      estado: false,
    },
  });
};

export const invalidateActiveMagicLinksByUserId = async (usuario_id: number) => {
  return await prisma.$executeRaw`
    UPDATE magic_link
    SET
      activo = false,
      invalidado_en = NOW(),
      ultimo_reenvio_en = NOW()
    WHERE usuario_id = ${usuario_id}
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
  usuario_id,
  tokenHash,
  correo,
  expira_en,
}: {
  usuario_id: number;
  tokenHash: string;
  correo: string;
  expira_en: Date;
}) => {
  return await prisma.magic_link.create({
    data: {
      usuario_id: usuario_id,
      token_hash: tokenHash,
      correo,
      expira_en: expira_en,
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
  usuario_id: number,
  metodo_auth: string,
  currentToken: string,
) => {
  return prisma.sesion.updateMany({
    where: {
      usuario_id,
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

