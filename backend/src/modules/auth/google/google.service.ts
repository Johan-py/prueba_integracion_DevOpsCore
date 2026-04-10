import crypto from "node:crypto";

import { env } from "../../../config/env.js";
import { generateToken, type JwtPayload } from "../../../utils/jwt.js";
import {
  createGoogleSession,
  createGoogleUser,
  findUserByGoogleEmail,
} from "./google.repository.js";
import {
  GoogleAuthError,
  type GoogleAuthIntent,
  type GoogleLoginSuccess,
  type GoogleTokenResponse,
  type GoogleUserInfo
} from './google.types.js'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
const SESSION_DURATION_MS = 60 * 60 * 1000

const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    })
  })

  const data = (await response.json()) as GoogleTokenResponse

  if (!response.ok || !data.access_token) {
    throw new GoogleAuthError(
      data.error_description || 'No se pudo obtener el token de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  return data
}

const getGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const data = (await response.json()) as GoogleUserInfo

  if (!response.ok || !data.email?.trim()) {
    throw new GoogleAuthError(
      'No se pudo obtener el correo de la cuenta de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  return data
}

const splitGoogleName = (googleUser: GoogleUserInfo) => {
  const givenName = googleUser.given_name?.trim() ?? "";
  const familyName = googleUser.family_name?.trim() ?? "";
  const fullName = googleUser.name?.trim() ?? "";

  if (givenName || familyName) {
    return {
      nombre: givenName || "Usuario",
      apellido: familyName || "Google",
    };
  }

  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      nombre: "Usuario",
      apellido: "Google",
    };
  }

  if (parts.length === 1) {
    return {
      nombre: parts[0],
      apellido: "Google",
    };
  }

  return {
    nombre: parts[0],
    apellido: parts.slice(1).join(" "),
  };
};

const createRandomGooglePassword = () => {
  return `google_${crypto.randomUUID()}_${Date.now()}`;
};

export const loginWithGoogleCodeService = async (
  code: string,
  intent: GoogleAuthIntent = "signin",
): Promise<GoogleLoginSuccess> => {
  if (!code?.trim()) {
    throw new GoogleAuthError('Google no devolvió un código válido.', 'GOOGLE_AUTH_FAILED', 400)
  }

  const tokenData = await exchangeCodeForTokens(code)
  const googleUser = await getGoogleUserInfo(tokenData.access_token as string)
  const correo = googleUser.email?.trim().toLowerCase()

  if (!correo) {
    throw new GoogleAuthError(
      'No se pudo determinar el correo de la cuenta de Google.',
      'GOOGLE_AUTH_FAILED',
      401
    )
  }

  let user = await findUserByGoogleEmail(correo);

  if (!user && intent === "signin") {
    throw new GoogleAuthError(
      "Esta cuenta de Google no está registrada. Regístrate primero.",
      "ACCOUNT_NOT_REGISTERED",
      404,
    );
  }

  if (user && intent === "signup") {
    throw new GoogleAuthError(
      "Este correo ya está registrado. Inicia sesión en su lugar.",
      "ACCOUNT_ALREADY_EXISTS",
      409,
    );
  }

  if (!user && intent === "signup") {
    const { nombre, apellido } = splitGoogleName(googleUser);

    user = await createGoogleUser({
      nombre,
      apellido,
      correo,
      password: createRandomGooglePassword(),
    });
  }

  if (!user) {
    throw new GoogleAuthError(
      "No se pudo completar la autenticación con Google.",
      "GOOGLE_AUTH_FAILED",
      400,
    );
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload)
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS)

  await createGoogleSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    message: "¡Registro exitoso! Bienvenido a PropBol.",
    token,
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
    },
  };
};
