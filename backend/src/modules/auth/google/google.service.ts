import { env } from "../../../config/env.ts";
import { generateToken, type JwtPayload } from "../../../utils/jwt.ts";
import {
  createGoogleSession,
  findUserByGoogleEmail,
} from "./google.repository.ts";
import {
  GoogleAuthError,
  type GoogleLoginSuccess,
  type GoogleTokenResponse,
  type GoogleUserInfo,
} from "./google.types.ts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const SESSION_DURATION_MS = 60 * 60 * 1000;

const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new GoogleAuthError(
      data.error_description || "No se pudo obtener el token de Google.",
      "GOOGLE_AUTH_FAILED",
      401,
    );
  }

  return data;
};

const getGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as GoogleUserInfo;

  if (!response.ok || !data.email?.trim()) {
    throw new GoogleAuthError(
      "No se pudo obtener el correo de la cuenta de Google.",
      "GOOGLE_AUTH_FAILED",
      401,
    );
  }

  return data;
};

export const loginWithGoogleCodeService = async (
  code: string,
): Promise<GoogleLoginSuccess> => {
  if (!code?.trim()) {
    throw new GoogleAuthError(
      "Google no devolvió un código válido.",
      "GOOGLE_AUTH_FAILED",
      400,
    );
  }

  const tokenData = await exchangeCodeForTokens(code);
  const googleUser = await getGoogleUserInfo(tokenData.access_token as string);
  const correo = googleUser.email?.trim().toLowerCase();

  if (!correo) {
    throw new GoogleAuthError(
      "No se pudo determinar el correo de la cuenta de Google.",
      "GOOGLE_AUTH_FAILED",
      401,
    );
  }

  const existingUser = await findUserByGoogleEmail(correo);

  if (!existingUser) {
    throw new GoogleAuthError(
      "La cuenta de Google no está registrada en la base de datos.",
      "ACCOUNT_NOT_REGISTERED",
      404,
    );
  }

  const jwtPayload: JwtPayload = {
    id: existingUser.id,
    correo: existingUser.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS);

  await createGoogleSession({
    token,
    usuarioId: existingUser.id,
    fechaExpiracion,
  });

  return {
    message: "Inicio de sesión con Google exitoso",
    token,
    user: {
      id: existingUser.id,
      correo: existingUser.correo,
      nombre: existingUser.nombre,
      apellido: existingUser.apellido,
    },
  };
};
