import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.client.js";
import {
  enviarCodigoDesactivacionCuenta,
  enviarCodigoActivacion2FA,
} from "../../lib/email.service.js";

import {
  deactivateUserAccountRepository,
  findUserPasswordByIdRepository,
  findSecurityUserByIdRepository,
  findUserGoogleAuthRepository,
} from "./security.repository.js";

export class SecurityError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "SecurityError";
    this.statusCode = statusCode;
  }
}

type AttemptState = {
  failedAttempts: number;
  blockedUntil: number | null;
};

type PendingDeactivationPayload = {
  purpose: "account-deactivation";
  userId: number;
  correo: string;
  nonce: string;
  codeSignature: string;
};

const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_TIME_MS = 15 * 60 * 1000;
const MAX_PASSWORD_LENGTH = 255;

const DEACTIVATION_CODE_TTL_MINUTES = 5;
const DEACTIVATION_CODE_TTL_SECONDS = DEACTIVATION_CODE_TTL_MINUTES * 60;

const attemptsStore = new Map<number, AttemptState>();

const getAttemptState = (userId: number): AttemptState => {
  const existingState = attemptsStore.get(userId);

  if (existingState) {
    return existingState;
  }

  const newState: AttemptState = {
    failedAttempts: 0,
    blockedUntil: null,
  };

  attemptsStore.set(userId, newState);
  return newState;
};

const getBlockStatus = (userId: number) => {
  const state = getAttemptState(userId);

  if (!state.blockedUntil) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const remainingMs = state.blockedUntil - Date.now();

  if (remainingMs <= 0) {
    attemptsStore.delete(userId);
    return { blocked: false, retryAfterSeconds: 0 };
  }

  return { blocked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
};

const registerFailedAttempt = (userId: number) => {
  const state = getAttemptState(userId);

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.blockedUntil = Date.now() + BLOCK_TIME_MS;
    attemptsStore.set(userId, state);

    return {
      blocked: true,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil(BLOCK_TIME_MS / 1000),
    };
  }

  attemptsStore.set(userId, state);

  return {
    blocked: false,
    attemptsLeft: MAX_FAILED_ATTEMPTS - state.failedAttempts,
    retryAfterSeconds: 0,
  };
};

const generateDeactivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const signDeactivationCode = ({
  codigo,
  correo,
  userId,
  nonce,
}: {
  codigo: string;
  correo: string;
  userId: number;
  nonce: string;
}) => {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(`${codigo}:${correo}:${userId}:${nonce}:account-deactivation`)
    .digest("hex");
};

const isMatchingCodeSignature = (
  expectedSignature: string,
  currentSignature: string,
) => {
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const currentBuffer = Buffer.from(currentSignature, "utf8");

  if (expectedBuffer.length !== currentBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, currentBuffer);
};

const generatePendingDeactivationToken = (
  payload: PendingDeactivationPayload,
) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: DEACTIVATION_CODE_TTL_SECONDS,
  });
};

const verifyPendingDeactivationToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
      PendingDeactivationPayload;

    if (decoded.purpose !== "account-deactivation") {
      throw new Error("Token inválido");
    }

    return decoded;
  } catch {
    throw new SecurityError(
      "El código expiró o ya no es válido. Solicita uno nuevo.",
      400,
    );
  }
};

const clearAttemptState = (userId: number) => {
  attemptsStore.delete(userId);
};

export const validateCurrentPasswordService = async (
  userId: number,
  password: string,
) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const blockStatus = getBlockStatus(userId);

  if (blockStatus.blocked) {
    const remainingMinutes = Math.ceil(blockStatus.retryAfterSeconds / 60);
    throw new SecurityError(
      `La cuenta sigue bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
      429,
    );
  }

  const rawPassword = typeof password === "string" ? password : "";
  const trimmedPassword = rawPassword.trim();

  if (!trimmedPassword) {
    throw new SecurityError(
      "La contraseña es obligatoria y no puede contener solo espacios en blanco.",
      400,
    );
  }

  if (rawPassword.length > MAX_PASSWORD_LENGTH) {
    throw new SecurityError(
      `La contraseña no puede superar ${MAX_PASSWORD_LENGTH} caracteres.`,
      400,
    );
  }

  const user = await findUserPasswordByIdRepository(userId);

  if (!user) {
    throw new SecurityError("Usuario no encontrado.", 404);
  }

  if (!user.password) {
    throw new SecurityError("El usuario no tiene contraseña registrada.", 400);
  }

  const isValidPassword = user.password === trimmedPassword;

  if (!isValidPassword) {
    const attemptStatus = registerFailedAttempt(userId);

    if (attemptStatus.blocked) {
      const blockMinutes = Math.ceil(BLOCK_TIME_MS / 60000);
      throw new SecurityError(
        `Has superado el número permitido de intentos. La cuenta fue bloqueada temporalmente por ${blockMinutes} minuto(s).`,
        429,
      );
    }

    throw new SecurityError(
      `Contraseña incorrecta. Te quedan ${attemptStatus.attemptsLeft} intento(s) antes del bloqueo temporal.`,
      400,
    );
  }

  clearAttemptState(userId);

  return { valid: true, message: "Contraseña válida." };
};

export const deactivateAccountService = async (
  userId: number,
  password: string,
) => {
  await validateCurrentPasswordService(userId, password);
  await deactivateUserAccountRepository(userId);

  return { message: "Tu cuenta ha sido desactivada correctamente." };
};
export const sendDeactivateAccountCodeService = async (userId: number) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const user = await findSecurityUserByIdRepository(userId);

  if (!user) {
    throw new SecurityError("Usuario no encontrado.", 404);
  }

  const codigo = generateDeactivationCode();
  const nonce = crypto.randomUUID();

  const verificationToken = generatePendingDeactivationToken({
    purpose: "account-deactivation",
    userId: user.id,
    correo: user.correo,
    nonce,
    codeSignature: signDeactivationCode({
      codigo,
      correo: user.correo,
      userId: user.id,
      nonce,
    }),
  });

  const emailResult = await enviarCodigoDesactivacionCuenta({
    emailDestino: user.correo,
    codigo,
    nombreUsuario: user.nombre,
  });
  if (!emailResult.success) {
    throw new SecurityError(
      "No se pudo enviar el código de verificación. Intenta nuevamente.",
      500,
    );
  }

  return {
    message: "Código enviado correctamente.",
    verificationToken,
    expiresInMinutes: DEACTIVATION_CODE_TTL_MINUTES,
  };
};

export const verifyDeactivateAccountCodeService = async ({
  userId,
  codigo,
  verificationToken,
}: {
  userId: number;
  codigo: string;
  verificationToken: string;
}) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const normalizedCode = codigo?.trim();
  const normalizedToken = verificationToken?.trim();

  if (!normalizedCode || !normalizedToken) {
    throw new SecurityError(
      "El código y el token de verificación son obligatorios.",
      400,
    );
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new SecurityError(
      "El código debe tener exactamente 6 dígitos numéricos.",
      400,
    );
  }

  const decoded = verifyPendingDeactivationToken(normalizedToken);

  if (decoded.userId !== userId) {
    throw new SecurityError("Token inválido para este usuario.", 403);
  }

  const expectedSignature = signDeactivationCode({
    codigo: normalizedCode,
    correo: decoded.correo,
    userId: decoded.userId,
    nonce: decoded.nonce,
  });

  if (!isMatchingCodeSignature(expectedSignature, decoded.codeSignature)) {
    throw new SecurityError("El código ingresado no es válido.", 400);
  }

  await deactivateUserAccountRepository(userId);

  return { message: "Tu cuenta ha sido desactivada correctamente." };
};

export const activate2FAService = async (userId: number, password?: string) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const isGoogleUser = await findUserGoogleAuthRepository(userId);

  if (isGoogleUser) {
    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        two_factor_activo: true,
        two_factor_activado_en: new Date(),
        two_factor_metodo: "email",
      },
      select: {
        two_factor_activo: true,
      },
    });
    return {
      message: "Verificación en dos pasos activada correctamente.",
      two_factor_activo: updatedUser.two_factor_activo,
    };
  }

  await validateCurrentPasswordService(userId, password ?? "");

  const updatedUser = await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: true,
      two_factor_activado_en: new Date(),
      two_factor_metodo: "email",
    },
    select: {
      two_factor_activo: true,
    },
  });

  return {
    message: "Verificación en dos pasos activada correctamente.",
    two_factor_activo: updatedUser.two_factor_activo,
  };
};

export const get2FAStatusService = async (userId: number) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const user = await findUserPasswordByIdRepository(userId);
  if (!user) throw new SecurityError("Usuario no encontrado.", 404);

  const isGoogleUser = await findUserGoogleAuthRepository(userId);

  return {
    two_factor_activo: user.two_factor_activo ?? false,
    isGoogleUser,
  };
};

// ── ACTIVAR 2FA POR CORREO ────────────────────────────────────────────────────

type PendingActivate2FAPayload = {
  purpose: "activate-2fa";
  userId: number;
  correo: string;
  nonce: string;
  codeSignature: string;
};

const ACTIVATE_2FA_CODE_TTL_MINUTES = 5;
const ACTIVATE_2FA_CODE_TTL_SECONDS = ACTIVATE_2FA_CODE_TTL_MINUTES * 60;

const signActivate2FACode = ({
  codigo,
  correo,
  userId,
  nonce,
}: {
  codigo: string;
  correo: string;
  userId: number;
  nonce: string;
}) => {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(`${codigo}:${correo}:${userId}:${nonce}:activate-2fa`)
    .digest("hex");
};

const generatePendingActivate2FAToken = (
  payload: PendingActivate2FAPayload,
) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACTIVATE_2FA_CODE_TTL_SECONDS,
  });
};

const verifyPendingActivate2FAToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
      PendingActivate2FAPayload;

    if (decoded.purpose !== "activate-2fa") {
      throw new Error("Token inválido");
    }

    return decoded;
  } catch {
    throw new SecurityError(
      "El código expiró o ya no es válido. Solicita uno nuevo.",
      400,
    );
  }
};

export const sendActivate2FACodeService = async (userId: number) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const user = await findSecurityUserByIdRepository(userId);
  if (!user) {
    throw new SecurityError("Usuario no encontrado.", 404);
  }

  const userRecord = await findUserPasswordByIdRepository(userId);
  if (userRecord?.two_factor_activo) {
    throw new SecurityError(
      "La verificación en dos pasos ya está activada.",
      400,
    );
  }

  const codigo = generateDeactivationCode();
  const nonce = crypto.randomUUID();

  const verificationToken = generatePendingActivate2FAToken({
    purpose: "activate-2fa",
    userId: user.id,
    correo: user.correo,
    nonce,
    codeSignature: signActivate2FACode({
      codigo,
      correo: user.correo,
      userId: user.id,
      nonce,
    }),
  });

  const emailResult = await enviarCodigoActivacion2FA({
    emailDestino: user.correo,
    codigo,
    nombreUsuario: user.nombre,
  });

  if (!emailResult.success) {
    throw new SecurityError(
      "No se pudo enviar el código de verificación. Intenta nuevamente.",
      500,
    );
  }

  return {
    message: "Código enviado correctamente.",
    verificationToken,
    expiresInMinutes: ACTIVATE_2FA_CODE_TTL_MINUTES,
  };
};

export const verifyActivate2FACodeService = async ({
  userId,
  codigo,
  verificationToken,
}: {
  userId: number;
  codigo: string;
  verificationToken: string;
}) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const normalizedCode = codigo?.trim();
  const normalizedToken = verificationToken?.trim();

  if (!normalizedCode || !normalizedToken) {
    throw new SecurityError(
      "El código y el token de verificación son obligatorios.",
      400,
    );
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new SecurityError(
      "El código debe tener exactamente 6 dígitos numéricos.",
      400,
    );
  }

  const decoded = verifyPendingActivate2FAToken(normalizedToken);

  if (decoded.userId !== userId) {
    throw new SecurityError("Token inválido para este usuario.", 403);
  }

  const expectedSignature = signActivate2FACode({
    codigo: normalizedCode,
    correo: decoded.correo,
    userId: decoded.userId,
    nonce: decoded.nonce,
  });

  if (!isMatchingCodeSignature(expectedSignature, decoded.codeSignature)) {
    throw new SecurityError("El código ingresado no es válido.", 400);
  }

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: true,
      two_factor_activado_en: new Date(),
      two_factor_metodo: "email",
    },
  });

  return {
    message: "Verificación en dos pasos activada correctamente.",
    two_factor_activo: true,
  };
};
