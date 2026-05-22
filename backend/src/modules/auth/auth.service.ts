import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.client.js";
import {
  enviarCodigo2FA,
  enviarCodigoRegistro,
  enviarCorreoRecuperacionPassword,
  enviarCodigoActivacionCuenta,
} from "../../lib/email.service.js";
import { generateToken, type JwtPayload } from "../../utils/jwt.js";
import { sendMagicLinkEmail } from "./magic-link-email.service.js";
import { cache } from "../../lib/cache.service.js";
import {
  createPasswordRecovery,
  createSession,
  createUser,
  desactiveSessionByToken,
  desactivarRecuperacionesPasswordActivas,
  findActiveSessionByToken,
  findPasswordRecoveryByToken,
  findUser,
  findUserByCorreo,
  markPasswordRecoveryAsUsed,
  findUserById,
  create2FACode,
  invalidateActive2FACodesByUserId,
  activate2FAByUserId,
  deactivate2FAByUserId,
  expire2FACode,
  getServerTime,
  findActive2FACodeByUserId,
  createMagicLink,
  increment2FACodeAttempts,
  mark2FACodeAsUsed,
  findMagicLinkByTokenHash,
  invalidateAllUserSessions,
  invalidateActiveMagicLinksByUserId,
  markMagicLinkAsUsed,
  deactivateMagicLink,
  findAny2FACodeByUserIdAndHash,
  activateUser,
} from "./auth.repository.js";

type LoginDTO = {
  correo: string;
  password: string;
};

type ActivateAccountByPasswordDTO = {
  correo: string;
  password: string;
};

export const activateAccountByPasswordService = async (
  payload: ActivateAccountByPasswordDTO,
) => {
  const correo = payload.correo?.trim().toLowerCase();
  const password = payload.password?.trim();

  if (!correo) {
    throw new AuthError("El correo es obligatorio", 400);
  }

  if (!password) {
    throw new AuthError("La contraseña es obligatoria", 400);
  }

  const user = await findUserByCorreo(correo);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.activo === true) {
    throw new AuthError("Esta cuenta ya está activa", 400);
  }

  if (user.password !== password) {
    throw new AuthError("Contraseña incorrecta", 401);
  }

  await activateUser(user.id);

  return {
    message: "Cuenta activada correctamente. Ya puedes iniciar sesión.",
  };
};

type RegisterDTO = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
};

type VerifyRegisterCodeDTO = {
  verificationToken: string;
  codigo: string;
  password: string;
};

type Verify2FADTO = {
  userId: number;
  codigo: string;
};

type PendingRegisterPayload = {
  purpose: "pending-register";
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  nonce: string;
  codeSignature: string;
};

type LoginAttemptState = {
  failedAttempts: number;
  blockedUntil: number | null;
};

type RequestMagicLinkDTO = {
  correo: string;
};

type LoginWithMagicLinkDTO = {
  token: string;
};

type MagicLinkJwtPayload = jwt.JwtPayload & {
  purpose?: string;
  userId?: number;
  correo?: string;
  nonce?: string;
};

export class AuthError extends Error {
  statusCode: number;
  retryAfterSeconds?: number;

  constructor(message: string, statusCode = 400, retryAfterSeconds?: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const MAX_NOMBRE = 30;
const MAX_APELLIDO = 30;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_TIME_MS = 15 * 60 * 1000;

const REGISTER_CODE_TTL_MINUTES = 5;
const MAGIC_LINK_TTL_MINUTES = 15;
const MAGIC_LINK_TTL_SECONDS = MAGIC_LINK_TTL_MINUTES * 60;
const MAGIC_LINK_RESEND_COOLDOWN_MS = 60 * 1000;
const magicLinkLastSentAt = new Map<string, number>();
const MAX_MAGIC_LINK_REQUESTS = 3;
const MAGIC_LINK_IN_PROGRESS_RETRY_SECONDS = 10;
const magicLinkRequestsInProgress = new Set<string>();

const MAGIC_LINK_REQUEST_WINDOW_MS = 5 * 60 * 1000;
const magicLinkRequests = new Map<string, number[]>();
const TWO_FACTOR_CODE_TTL_MINUTES = 1;

// límite de solicitudes de recuperación
const MAX_RECOVERY_REQUESTS = 3;
const RECOVERY_WINDOW_MS = 5 * 60 * 1000;
const recoveryRequests = new Map<string, number[]>();

// límite de intentos por enlace
const MAX_TOKEN_ATTEMPTS = 3;
const tokenAttempts = new Map<string, number>();
const REGISTER_CODE_TTL_SECONDS = REGISTER_CODE_TTL_MINUTES * 60;

const loginAttempts = new Map<string, LoginAttemptState>();

const DUPLICATE_EMAIL_MESSAGE = "El correo ya está registrado";

const isDuplicateEmailError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  const normalized = error.message.toLowerCase();

  return (
    normalized === DUPLICATE_EMAIL_MESSAGE.toLowerCase() ||
    (normalized.includes("unique constraint failed") &&
      normalized.includes("correo"))
  );
};

const getAttemptState = (correo: string): LoginAttemptState => {
  const existingState = loginAttempts.get(correo);

  if (existingState) {
    return existingState;
  }

  const newState: LoginAttemptState = {
    failedAttempts: 0,
    blockedUntil: null,
  };

  loginAttempts.set(correo, newState);
  return newState;
};

const getBlockStatus = (correo: string) => {
  const state = getAttemptState(correo);

  if (!state.blockedUntil) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const remainingMs = state.blockedUntil - Date.now();

  if (remainingMs <= 0) {
    loginAttempts.delete(correo);
    return { blocked: false, retryAfterSeconds: 0 };
  }

  return { blocked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
};

const registerFailedAttempt = (correo: string) => {
  const state = getAttemptState(correo);

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    state.blockedUntil = Date.now() + LOGIN_BLOCK_TIME_MS;
    loginAttempts.set(correo, state);

    return {
      blocked: true,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil(LOGIN_BLOCK_TIME_MS / 1000),
    };
  }

  loginAttempts.set(correo, state);

  return {
    blocked: false,
    attemptsLeft: MAX_LOGIN_ATTEMPTS - state.failedAttempts,
    retryAfterSeconds: 0,
  };
};
const clearFailedAttempts = (correo: string) => {
  loginAttempts.delete(correo);
};

const normalizeRegisterPayload = (payload: RegisterDTO) => {
  const nombre = payload.nombre?.trim();
  const apellido = payload.apellido?.trim();
  const correo = payload.correo?.trim().toLowerCase();
  const password = payload.password?.trim();
  const confirmPassword = payload.confirmPassword?.trim();
  const telefono = payload.telefono?.trim() || undefined;

  if (!nombre || !apellido || !correo || !password || !confirmPassword) {
    throw new Error("Todos los campos obligatorios deben ser completados");
  }

  if (nombre.length > MAX_NOMBRE) {
    throw new Error(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);
  }

  if (apellido.length > MAX_APELLIDO) {
    throw new Error(`El apellido no puede superar ${MAX_APELLIDO} caracteres`);
  }

  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  return { nombre, apellido, correo, password, telefono };
};

const generateRegisterCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hash2FACode = (codigo: string) => {
  return crypto.createHash("sha256").update(codigo).digest("hex");
};

const hashMagicLinkToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const validateMagicLinkResendCooldown = (correo: string) => {
  const lastSentAt = magicLinkLastSentAt.get(correo);

  if (!lastSentAt) {
    return;
  }

  const elapsedMs = Date.now() - lastSentAt;

  if (elapsedMs < MAGIC_LINK_RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil(
      (MAGIC_LINK_RESEND_COOLDOWN_MS - elapsedMs) / 1000,
    );

    throw new AuthError(
      `Debes esperar ${retryAfterSeconds} segundo(s) antes de solicitar otro Magic Link.`,
      429,
      retryAfterSeconds,
    );
  }
};

const registerMagicLinkSent = (correo: string) => {
  magicLinkLastSentAt.set(correo, Date.now());
};

const validateMagicLinkRequestLimit = (correo: string) => {
  const now = Date.now();

  const recentRequests = (magicLinkRequests.get(correo) ?? []).filter(
    (timestamp) => now - timestamp < MAGIC_LINK_REQUEST_WINDOW_MS,
  );

  if (recentRequests.length >= MAX_MAGIC_LINK_REQUESTS) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfterSeconds = Math.ceil(
      (MAGIC_LINK_REQUEST_WINDOW_MS - (now - oldestRequest)) / 1000,
    );

    throw new AuthError(
      "Has solicitado demasiados Magic Links. Intenta nuevamente en unos minutos.",
      429,
      retryAfterSeconds,
    );
  }

  recentRequests.push(now);
  magicLinkRequests.set(correo, recentRequests);
};

const signRegisterCode = ({
  codigo,
  correo,
  nonce,
}: {
  codigo: string;
  correo: string;
  nonce: string;
}) => {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(`${codigo}:${correo}:${nonce}:pending-register`)
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

const generatePendingRegisterToken = (payload: PendingRegisterPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: REGISTER_CODE_TTL_SECONDS,
  });
};

const verifyPendingRegisterToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
      PendingRegisterPayload;

    if (decoded.purpose !== "pending-register") {
      throw new Error("Token de verificación inválido");
    }

    return decoded;
  } catch {
    throw new Error(
      "El código expiró o ya no es válido. Vuelve a registrarte.",
    );
  }
};

export const loginService = async (payload: LoginDTO) => {
  const correo = payload.correo?.trim().toLowerCase();
  const password = payload.password?.trim();

  if (!correo || !password) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const blockStatus = getBlockStatus(correo);

  if (blockStatus.blocked) {
    const remainingMinutes = Math.ceil(blockStatus.retryAfterSeconds / 60);

    throw new AuthError(
      `La cuenta sigue bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
      429,
      blockStatus.retryAfterSeconds,
    );
  }

  const user = await findUser(correo);

  if (!user) {
    throw new AuthError(
      "Esta cuenta no está registrada. Puedes registrarte para crear una cuenta.",
      404,
    );
  }

  const isValidPassword = user.password === password;

  if (!isValidPassword) {
    const attemptStatus = registerFailedAttempt(correo);

    if (attemptStatus.blocked) {
      const blockMinutes = Math.ceil(LOGIN_BLOCK_TIME_MS / 60000);

      throw new AuthError(
        `Has superado el número permitido de intentos. La cuenta fue bloqueada temporalmente por ${blockMinutes} minuto(s).`,
        429,
        attemptStatus.retryAfterSeconds,
      );
    }

    throw new AuthError(
      `Contraseña incorrecta. Te quedan ${attemptStatus.attemptsLeft} intento(s) antes del bloqueo temporal.`,
      401,
    );
  }

  clearFailedAttempts(correo);

  if (user.activo === false) {
    throw new AuthError("Esta cuenta está desactivada", 403);
  }

  if (user.two_factor_activo) {
    const codigo = generate2FACode();
    const codigoHash = hash2FACode(codigo);
    const expiraEn = new Date(
      Date.now() + TWO_FACTOR_CODE_TTL_MINUTES * 60 * 1000,
    );

    await invalidateActive2FACodesByUserId(user.id);

    await create2FACode({
      usuarioId: user.id,
      codigoHash,
      expiraEn,
    });

    const emailResult = await enviarCodigo2FA({
      emailDestino: user.correo,
      codigo,
      nombreUsuario: user.nombre,
    });

    if (!emailResult.success) {
      throw new Error(
        "No se pudo enviar el código de verificación 2FA. Intenta nuevamente.",
      );
    }

    return {
      requires2FA: true,
      userId: user.id,
      email: user.correo,
      expiresInMinutes: TWO_FACTOR_CODE_TTL_MINUTES,
    };
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    requires2FA: false,
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      avatar: user.avatar,
      rol: user.rol,
    },
    token,
  };
};

export const verify2FAService = async ({ userId, codigo }: Verify2FADTO) => {
  const normalizedCode = codigo?.trim();

  if (!userId || !normalizedCode) {
    throw new AuthError("El usuario y el código son obligatorios", 400);
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new AuthError(
      "El código debe tener exactamente 6 dígitos numéricos",
      400,
    );
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (!user.two_factor_activo) {
    throw new AuthError(
      "El usuario no tiene autenticación en dos pasos activada",
      400,
    );
  }

  const activeCode = await findActive2FACodeByUserId(userId);

  if (!activeCode) {
    throw new AuthError("El código es incorrecto", 401);
  }

  if (activeCode.expiraEn.getTime() < Date.now()) {
    await expire2FACode(activeCode.id);
    throw new AuthError("El código ha expirado", 401);
  }

  const codigoHash = hash2FACode(normalizedCode);

  if (codigoHash !== activeCode.codigoHash) {
    await increment2FACodeAttempts(activeCode.id, activeCode.intentos ?? 0);
    throw new AuthError("El código es incorrecto", 401);
  }

  await mark2FACodeAsUsed(activeCode.id);

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      avatar: user.avatar,
      rol: user.rol,
    },
    token,
  };
};

export const registerUser = async (payload: RegisterDTO) => {
  const normalized = normalizeRegisterPayload(payload);

  const existingUser = await findUserByCorreo(normalized.correo);

  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  const codigo = generateRegisterCode();
  const nonce = crypto.randomUUID();

  const codigoHash = hash2FACode(codigo);
  cache.set(
    `last_reg_code_${normalized.correo}`,
    codigoHash,
    REGISTER_CODE_TTL_MINUTES * 60 * 1000,
  );

  const verificationToken = generatePendingRegisterToken({
    purpose: "pending-register",
    nombre: normalized.nombre,
    apellido: normalized.apellido,
    correo: normalized.correo,
    telefono: normalized.telefono,
    nonce,
    codeSignature: signRegisterCode({
      codigo,
      correo: normalized.correo,
      nonce,
    }),
  });

  const emailResult = await enviarCodigoRegistro({
    emailDestino: normalized.correo,
    codigo,
    nombreUsuario: normalized.nombre,
  });

  if (!emailResult.success) {
    throw new Error(
      "No se pudo enviar el código de verificación. Intenta nuevamente.",
    );
  }

  return {
    email: normalized.correo,
    verificationToken,
    requiresEmailVerification: true,
    expiresInMinutes: REGISTER_CODE_TTL_MINUTES,
  };
};

export const verifyRegisterCodeService = async (
  payload: VerifyRegisterCodeDTO,
) => {
  const verificationToken = payload.verificationToken?.trim();
  const codigo = payload.codigo?.trim();
  const password = payload.password?.trim();

  if (!verificationToken || !codigo || !password) {
    throw new Error("Token, código y contraseña son obligatorios");
  }

  const decoded = verifyPendingRegisterToken(verificationToken);

  const expectedSignature = signRegisterCode({
    codigo,
    correo: decoded.correo,
    nonce: decoded.nonce,
  });

  if (!isMatchingCodeSignature(expectedSignature, decoded.codeSignature)) {
    throw new Error("El código ingresado no es válido");
  }

  const codigoHash = hash2FACode(codigo);
  const lastCodeHash = cache.get<string>(`last_reg_code_${decoded.correo}`);

  if (lastCodeHash && lastCodeHash !== codigoHash) {
    throw new AuthError(
      "El código ingresado ha sido reemplazado. Por favor, use el código del correo más reciente",
      401,
    );
  }

  const existingUser = await findUserByCorreo(decoded.correo);

  if (existingUser) {
    throw new AuthError(DUPLICATE_EMAIL_MESSAGE, 409);
  }

  let newUser;

  try {
    newUser = await createUser({
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      correo: decoded.correo,
      password,
      telefono: decoded.telefono,
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new AuthError(DUPLICATE_EMAIL_MESSAGE, 409);
    }

    throw error;
  }

  // Limpiar el caché tras registro exitoso
  cache.delete(`last_reg_code_${decoded.correo}`);

  const jwtPayload: JwtPayload = {
    id: newUser.id,
    correo: newUser.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token,
    usuarioId: newUser.id,
    fechaExpiracion,
  });

  return {
    user: {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      correo: newUser.correo,
      telefonos: newUser.telefonos,
    },
    token,
  };
};

export const getMeService = async (token: string) => {
  const session = await findActiveSessionByToken(token);

  if (!session) {
    throw new Error("Sesión inválida o expirada");
  }

  if (session.usuario.activo === false) {
    throw new AuthError("Esta cuenta está desactivada", 403);
  }

  return {
    user: {
      id: session.usuario.id,
      nombre: session.usuario.nombre,
      apellido: session.usuario.apellido,
      avatar: session.usuario.avatar,
      correo: session.usuario.correo,
      rol: session.usuario.rol,
    },
  };
};

export const logoutService = async (token: string) => {
  const session = await findActiveSessionByToken(token);

  if (!session) {
    throw new Error("Sesión inválida o expirada");
  }

  await desactiveSessionByToken(token);

  return { message: "Logout exitoso" };
};

type VerifyPasswordDTO = {
  userId: number;
  password: string;
};

export const verifyPasswordService = async ({
  userId,
  password,
}: VerifyPasswordDTO) => {
  const trimmed = password?.trim();

  if (!trimmed) {
    throw new AuthError("La contraseña es obligatoria", 400);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.password !== trimmed) {
    throw new AuthError("Contraseña incorrecta", 401);
  }

  return { valid: true };
};

export const activate2FAService = async ({
  userId,
  password,
}: VerifyPasswordDTO) => {
  const trimmed = password?.trim();

  if (!trimmed) {
    throw new AuthError("La contraseña es obligatoria", 400);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.password !== trimmed) {
    throw new AuthError("Contraseña incorrecta", 401);
  }

  await activate2FAByUserId(userId);

  return {
    message: "Verificación en dos pasos activada correctamente",
    two_factor_activo: true,
  };
};

export const deactivate2FAService = async (userId: number) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  await deactivate2FAByUserId(userId);

  return {
    message: "Verificación en dos pasos desactivada correctamente",
    two_factor_activo: false,
  };
};

export const get2FAStatusService = async (userId: number) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  return {
    two_factor_activo: user.two_factor_activo,
  };
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfoResponse = {
  id?: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export const loginWithGoogleCodeService = async (code: string) => {
  const normalizedCode = code?.trim();

  if (!normalizedCode) {
    throw new Error("Google no devolvió un código válido");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: normalizedCode,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error("No se pudo validar la autenticación con Google");
  }

  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  const googleUser = (await userInfoResponse.json()) as GoogleUserInfoResponse;

  if (!userInfoResponse.ok) {
    throw new Error("No se pudo obtener la información de la cuenta de Google");
  }

  const correo = googleUser.email?.trim().toLowerCase();

  if (!correo || googleUser.verified_email === false) {
    throw new Error("Google no devolvió un correo válido");
  }

  const user = await findUserByCorreo(correo);

  if (!user) {
    throw new AuthError(
      "Esta cuenta de Google no está registrada. Regístrate primero.",
      404,
    );
  }

  if (user.activo === false) {
    throw new AuthError("Esta cuenta está desactivada", 403);
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      avatar: user.avatar,
      rol: user.rol,
    },
    token,
  };
};

type ForgotPasswordDTO = {
  correo: string;
};

const RESET_PASSWORD_TTL_MINUTES = 15;

export const requestMagicLinkService = async (payload: RequestMagicLinkDTO) => {
  const correo = payload.correo?.trim().toLowerCase();

  if (!correo) {
    throw new AuthError("El correo es obligatorio", 400);
  }

  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(correo)) {
    throw new AuthError("Formato de correo inválido", 400);
  }

  const user = await findUserByCorreo(correo);

  if (!user) {
    throw new AuthError(
      "No existe una cuenta registrada con este correo electrónico.",
      404,
    );
  }

  if (user.activo === false) {
    throw new AuthError("Esta cuenta está desactivada", 403);
  }

  if (magicLinkRequestsInProgress.has(correo)) {
    throw new AuthError(
      "Ya se está procesando una solicitud de Magic Link para este correo. Espera unos segundos e intenta nuevamente.",
      429,
      MAGIC_LINK_IN_PROGRESS_RETRY_SECONDS,
    );
  }

  magicLinkRequestsInProgress.add(correo);
  validateMagicLinkResendCooldown(correo);

  try {
    validateMagicLinkRequestLimit(correo);

    const serverNow = await getServerTime();
    const expiraEn = new Date(
      serverNow.getTime() + MAGIC_LINK_TTL_MINUTES * 60 * 1000,
    );

    const magicToken = jwt.sign(
      {
        purpose: "magic-link-login",
        userId: user.id,
        correo: user.correo,
        nonce: crypto.randomUUID(),
      },
      env.JWT_SECRET,
      {
        expiresIn: MAGIC_LINK_TTL_SECONDS,
      },
    );

    const tokenHash = hashMagicLinkToken(magicToken);

    await invalidateActiveMagicLinksByUserId(user.id);

    await createMagicLink({
      usuarioId: user.id,
      tokenHash,
      correo: user.correo,
      expiraEn,
    });

    const magicLink = `${env.FRONTEND_URL}/magic-link-sent?token=${magicToken}`;

    const emailResult = await sendMagicLinkEmail({
      emailDestino: user.correo,
      nombreUsuario: user.nombre ?? undefined,
      magicLink,
      minutosExpiracion: MAGIC_LINK_TTL_MINUTES,
    });

    if (!emailResult.success) {
      throw new AuthError(
        "No se pudo enviar el link mágico. Intenta nuevamente.",
        500,
      );
    }
    registerMagicLinkSent(correo);
    return {
      message: "Te enviamos un link mágico a tu correo electrónico.",
    };
  } finally {
    magicLinkRequestsInProgress.delete(correo);
  }
};

export const resendMagicLinkService = async (payload: RequestMagicLinkDTO) => {
  return await requestMagicLinkService(payload);
};

const verifyMagicLinkToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as MagicLinkJwtPayload;

    if (
      decoded.purpose !== "magic-link-login" ||
      typeof decoded.userId !== "number" ||
      !decoded.correo
    ) {
      throw new AuthError("El Magic Link fue alterado o no es válido.", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError("Este Magic Link ha expirado.", 401);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError("El Magic Link fue alterado o no es válido.", 401);
    }

    throw new AuthError("El Magic Link no es válido.", 401);
  }
};

export const loginWithMagicLinkService = async ({
  token,
}: LoginWithMagicLinkDTO) => {
  const magicToken = token?.trim();

  if (!magicToken) {
    throw new AuthError("El token es obligatorio", 400);
  }

  const decoded = verifyMagicLinkToken(magicToken);
  const tokenHash = hashMagicLinkToken(magicToken);

  const magicLink = await findMagicLinkByTokenHash(tokenHash);

  if (!magicLink) {
    throw new AuthError(
      "Este enlace no es reconocido. Solicita un nuevo Magic Link para ingresar.",
      404,
    );
  }

  if (magicLink.activo === false || magicLink.usado_en) {
    throw new AuthError("Este Magic Link ya fue utilizado.", 401);
  }

  if (magicLink.invalidado_en) {
    throw new AuthError(
      "Este Magic Link fue invalidado porque se solicitó uno nuevo.",
      401,
    );
  }

  const serverNow = await getServerTime();

  if (magicLink.expira_en.getTime() < serverNow.getTime()) {
    await deactivateMagicLink(magicLink.id);

    throw new AuthError("Este Magic Link ha expirado.", 401);
  }

  if (
    magicLink.usuario_id !== decoded.userId ||
    magicLink.correo !== decoded.correo
  ) {
    throw new AuthError("El Magic Link no corresponde al usuario.", 401);
  }

  const user = await findUserById(decoded.userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.activo === false) {
    throw new AuthError("Esta cuenta está desactivada", 403);
  }

  const wasMarkedAsUsed = await markMagicLinkAsUsed(magicLink.id);

  if (!wasMarkedAsUsed) {
    throw new AuthError("Este Magic Link ya fue utilizado.", 401);
  }

  await invalidateAllUserSessions(user.id);

  const sessionPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const sessionToken = generateToken(sessionPayload);
  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token: sessionToken,
    usuarioId: user.id,
    fechaExpiracion,
    metodo_auth: "magic_link",
  });

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      avatar: user.avatar,
      rol: user.rol,
      controlador: user.controlador,
    },
    token: sessionToken,
  };
};

export const forgotPasswordService = async (payload: ForgotPasswordDTO) => {
  const correo = payload.correo?.trim().toLowerCase();

  if (!correo) {
    throw new Error("El correo es obligatorio");
  }

  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(correo)) {
    throw new Error("Formato de correo inválido");
  }

  const user = await findUserByCorreo(correo);

  const now = Date.now();
  const requests = (recoveryRequests.get(correo) ?? []).filter(
    (t) => now - t < RECOVERY_WINDOW_MS,
  );
  if (requests.length >= MAX_RECOVERY_REQUESTS) {
    throw new AuthError(
      "Demasiadas solicitudes. Intenta nuevamente en 5 minutos.",
      429,
    );
  }
  recoveryRequests.set(correo, [...requests, now]);

  // Respuesta genérica para no revelar si el correo existe o no
  if (!user) {
    return {
      message:
        "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
    };
  }

  const resetToken = crypto.randomUUID();
  const expiraEn = new Date(
    Date.now() + RESET_PASSWORD_TTL_MINUTES * 60 * 1000,
  );

  await desactivarRecuperacionesPasswordActivas(user.id);

  await createPasswordRecovery({
    usuarioId: user.id,
    token: resetToken,
    expiraEn,
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const emailResult = await enviarCorreoRecuperacionPassword({
    emailDestino: user.correo,
    nombreUsuario: user.nombre,
    resetLink,
    minutosExpiracion: RESET_PASSWORD_TTL_MINUTES,
  });

  if (!emailResult.success) {
    throw new Error(
      "No se pudo enviar el correo de recuperación. Intenta nuevamente.",
    );
  }

  return {
    message:
      "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
  };
};

type ResetPasswordDTO = {
  token: string;
  password: string;
  confirmPassword: string;
};

export const resetPasswordService = async (payload: ResetPasswordDTO) => {
  const token = payload.token?.trim();
  const password = payload.password?.trim();
  const confirmPassword = payload.confirmPassword?.trim();

  if (!token || !password || !confirmPassword) {
    throw new AuthError("Todos los campos son obligatorios", 400);
  }

  if (password !== confirmPassword) {
    throw new AuthError("Las contraseñas no coinciden", 400);
  }

  if (password.length < 8) {
    throw new AuthError("La contraseña debe tener al menos 8 caracteres", 400);
  }

  if (!/[A-Z]/.test(password)) {
    throw new AuthError(
      "La contraseña debe contener al menos una mayúscula",
      400,
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new AuthError("La contraseña debe contener al menos un número", 400);
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new AuthError(
      "La contraseña debe contener al menos un carácter especial",
      400,
    );
  }

  const recovery = await findPasswordRecoveryByToken(token);

  if (!recovery || !recovery.activo) {
    throw new AuthError("El enlace no es válido o ya fue utilizado", 400);
  }

  if (new Date() > recovery.expiraEn) {
    throw new AuthError("El enlace ha expirado. Solicita uno nuevo.", 400);
  }

  const attempts = tokenAttempts.get(token) ?? 0;
  if (attempts >= MAX_TOKEN_ATTEMPTS) {
    await markPasswordRecoveryAsUsed(recovery.id);
    tokenAttempts.delete(token);
    throw new AuthError(
      "Demasiados intentos. El enlace ha sido invalidado.",
      429,
    );
  }

  tokenAttempts.set(token, attempts + 1);

  // Obtener el usuario para validar que la nueva contraseña sea diferente
  const user = await findUserById(recovery.usuarioId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  // Validar que la nueva contraseña sea diferente a la actual
  if (user.password === password) {
    throw new AuthError(
      "La nueva contraseña debe ser diferente a la contraseña actual",
      400,
    );
  }

  await prisma.$transaction([
    prisma.recuperacion_password.update({
      where: { id: recovery.id },
      data: { usadoEn: new Date(), activo: false },
    }),
    prisma.usuario.update({
      where: { id: recovery.usuarioId },
      data: { password },
    }),
    prisma.sesion.updateMany({
      where: { usuarioId: recovery.usuarioId, estado: true },
      data: { estado: false },
    }),
  ]);

  tokenAttempts.delete(token);

  return {
    message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
  };
};
export const resend2FAService = async (userId: number) => {
  if (!userId) {
    throw new AuthError("El usuario es obligatorio", 400);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (!user.two_factor_activo) {
    throw new AuthError("El usuario no tiene 2FA activado", 400);
  }

  const codigo = generate2FACode();
  const codigoHash = hash2FACode(codigo);
  const expiraEn = new Date(
    Date.now() + TWO_FACTOR_CODE_TTL_MINUTES * 60 * 1000,
  );

  await invalidateActive2FACodesByUserId(user.id);

  await create2FACode({
    usuarioId: user.id,
    codigoHash,
    expiraEn,
  });

  const emailResult = await enviarCodigo2FA({
    emailDestino: user.correo,
    codigo,
    nombreUsuario: user.nombre,
  });

  if (!emailResult.success) {
    throw new Error("No se pudo reenviar el código. Intenta nuevamente.");
  }

  return {
    message: "Código reenviado correctamente",
    expiresInMinutes: TWO_FACTOR_CODE_TTL_MINUTES,
  };
};

export const requestActivationCodeService = async (correo: string) => {
  const normalizedCorreo = correo?.trim().toLowerCase();

  if (!normalizedCorreo) {
    throw new AuthError("El correo es obligatorio", 400);
  }

  const user = await findUserByCorreo(normalizedCorreo);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.activo === true) {
    throw new AuthError("Esta cuenta ya está activa", 400);
  }

  const codigo = generate2FACode();
  const codigoHash = hash2FACode(codigo);
  const expiraEn = new Date(
    Date.now() + TWO_FACTOR_CODE_TTL_MINUTES * 60 * 1000,
  );

  await invalidateActive2FACodesByUserId(user.id);

  await create2FACode({
    usuarioId: user.id,
    codigoHash,
    expiraEn,
  });

  const emailResult = await enviarCodigoActivacionCuenta({
    emailDestino: user.correo,
    codigo,
    nombreUsuario: user.nombre,
  });

  if (!emailResult.success) {
    throw new Error(
      "No se pudo enviar el código de activación. Intenta nuevamente.",
    );
  }

  return {
    message: "Código de activación enviado correctamente",
    expiresInMinutes: TWO_FACTOR_CODE_TTL_MINUTES,
  };
};

export const activateAccountByCodeService = async (
  correo: string,
  codigo: string,
) => {
  const normalizedCorreo = correo?.trim().toLowerCase();
  const normalizedCode = codigo?.trim();

  if (!normalizedCorreo || !normalizedCode) {
    throw new AuthError("Correo y código son obligatorios", 400);
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new AuthError(
      "El código debe tener exactamente 6 dígitos numéricos",
      400,
    );
  }

  const user = await findUserByCorreo(normalizedCorreo);

  if (!user) {
    throw new AuthError("Usuario no encontrado", 404);
  }

  if (user.activo === true) {
    throw new AuthError("Esta cuenta ya está activa", 400);
  }

  const activeCode = await findActive2FACodeByUserId(user.id);

  if (!activeCode) {
    throw new AuthError("El código es inválido", 401);
  }

  if (activeCode.expiraEn.getTime() < Date.now()) {
    await expire2FACode(activeCode.id);
    throw new AuthError("El código expiró", 401);
  }

  const codigoHash = hash2FACode(normalizedCode);

  if (codigoHash !== activeCode.codigoHash) {
    const anyCode = await findAny2FACodeByUserIdAndHash(user.id, codigoHash);

    if (anyCode) {
      throw new AuthError(
        "El código ingresado ha sido reemplazado. Por favor, use el código del correo más reciente",
        401,
      );
    }

    await increment2FACodeAttempts(activeCode.id, activeCode.intentos ?? 0);
    throw new AuthError("El código es inválido", 401);
  }

  await mark2FACodeAsUsed(activeCode.id);
  await activateUser(user.id);

  return {
    message: "Cuenta activada correctamente. Ya puedes iniciar sesión.",
  };
};

export const resendRegisterCodeService = async (verificationToken: string) => {
  if (!verificationToken) {
    throw new Error("El token de verificación es obligatorio");
  }

  const decoded = verifyPendingRegisterToken(verificationToken);

  const codigo = generateRegisterCode();
  const nonce = crypto.randomUUID();

  const codigoHash = hash2FACode(codigo);
  cache.set(
    `last_reg_code_${decoded.correo}`,
    codigoHash,
    REGISTER_CODE_TTL_MINUTES * 60 * 1000,
  );

  const newToken = generatePendingRegisterToken({
    purpose: "pending-register",
    nombre: decoded.nombre,
    apellido: decoded.apellido,
    correo: decoded.correo,
    telefono: decoded.telefono,
    nonce,
    codeSignature: signRegisterCode({
      codigo,
      correo: decoded.correo,
      nonce,
    }),
  });

  const emailResult = await enviarCodigoRegistro({
    emailDestino: decoded.correo,
    codigo,
    nombreUsuario: decoded.nombre,
  });

  if (!emailResult.success) {
    throw new Error(
      "No se pudo reenviar el código de verificación. Intenta nuevamente.",
    );
  }

  return {
    verificationToken: newToken,
    expiresInMinutes: REGISTER_CODE_TTL_MINUTES,
  };
};
