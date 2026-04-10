import type { Request, Response } from "express";
import { env } from "../../../config/env.js";
import { loginWithGoogleCodeService } from "./google.service.js";
import { GoogleAuthError, type GoogleAuthIntent } from "./google.types.js";

const isValidIntent = (value: string): value is GoogleAuthIntent => {
  return value === "signin" || value === "signup";
};

const resolveIntent = (value: unknown): GoogleAuthIntent => {
  return typeof value === "string" && isValidIntent(value) ? value : "signin";
};

const buildGoogleAuthUrl = (intent: GoogleAuthIntent) => {
  return (
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent select_account",
      include_granted_scopes: "true",
      state: intent,
    }).toString()
  );
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const sendPopupResponse = (
  res: Response,
  intent: GoogleAuthIntent,
  payload:
    | {
        type: "propbol:google-login-success";
        message: string;
        token: string;
        user: {
          id: number;
          correo: string;
          nombre: string;
          apellido: string;
        };
      }
    | {
        type: "propbol:google-login-error";
        code: string;
        message: string;
      },
) => {
  const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(env.FRONTEND_URL);
  const title = intent === "signup" ? "Registro con Google" : "Inicio de sesión con Google";
  const fallbackMessage =
    payload.type === "propbol:google-login-success"
      ? "Autenticación con Google completada. Puedes cerrar esta ventana."
      : payload.message;

  return res.status(200).type("html").send(`<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
    </head>
    <body>
        <p>${escapeHtml(fallbackMessage)}</p>
        <script>
        (function () {
            const payload = ${serializedPayload};
            const targetOrigin = ${targetOrigin};

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(payload, targetOrigin);
            }

            window.close();
        })();
        </script>
    </body>
    </html>`);
};

export const StratGoogleLoginController = (req: Request, res: Response) => {
  const intent = resolveIntent(req.query.intent);
  return res.redirect(buildGoogleAuthUrl(intent));
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const error = typeof req.query.error === "string" ? req.query.error : "";
  const intent = resolveIntent(req.query.state);

  if (error) {
    return sendPopupResponse(res, intent, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message: "La autenticación con Google fue cancelada o falló.",
    });
  }

  if (!code) {
    return sendPopupResponse(res, intent, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message: "Google no devolvió un código válido.",
    });
  }

  try {
    const result = await loginWithGoogleCodeService(code, intent);

    return sendPopupResponse(res, intent, {
      type: "propbol:google-login-success",
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return sendPopupResponse(res, intent, {
        type: "propbol:google-login-error",
        code: error.code,
        message: error.message,
      });
    }

    return sendPopupResponse(res, intent, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message: "No se pudo completar la autenticación con Google.",
    });
  }
};
