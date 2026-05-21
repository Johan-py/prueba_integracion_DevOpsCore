import type { Request, Response } from "express";
import { env } from "../../../config/env.js";
import {
  linkGoogleToCurrentUserByCodeService,
  loginWithGoogleCodeService,
  registerWithGoogleCodeService,
} from "./google.service.js";
import { GoogleAuthError, type GoogleStatePayload } from "./google.types.js";

type GoogleFlowMode = "login" | "register";

const encodeState = (value: GoogleStatePayload) => {
  return Buffer.from(JSON.stringify(value), "utf-8").toString("base64url");
};

const decodeState = (
  rawState: string | undefined,
): GoogleStatePayload | null => {
  if (!rawState?.trim()) return null;

  if (rawState === "login" || rawState === "register") {
    return { mode: rawState };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(rawState, "base64url").toString("utf-8"),
    ) as GoogleStatePayload;

    if (!parsed || typeof parsed !== "object" || !("mode" in parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildGoogleAuthUrl = (
  mode: GoogleFlowMode | "link",
  sessionToken?: string,
) => {
  const state =
    mode === "link"
      ? encodeState({
          mode: "link",
          sessionToken: sessionToken ?? "",
        })
      : mode;

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
      state,
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
  payload:
    | {
        type: "propbol:google-login-success";
        message: string;
        token: string;
        user: {
          id: number;
          correo: string;
          nombre?: string;
          apellido?: string;
        };
      }
    | {
        type: "propbol:google-login-error";
        code: string;
        message: string;
      }
    | {
        type: "propbol:social-link-success";
        provider: "google";
        message: string;
        linkedEmail: string | null;
      }
    | {
        type: "propbol:social-link-error";
        provider: "google";
        code: string;
        message: string;
      },
) => {
  const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(env.FRONTEND_URL);
  const fallbackMessage = payload.message;

  return res.status(200).type("html").send(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Autenticación con Google</title>
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

export const StratGoogleLoginController = (_req: Request, res: Response) => {
  return res.redirect(buildGoogleAuthUrl("login"));
};

export const StartGoogleRegisterController = (_req: Request, res: Response) => {
  return res.redirect(buildGoogleAuthUrl("register"));
};

export const getGoogleLinkUrlController = (req: Request, res: Response) => {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return res.status(401).json({
      message: "No se encontró una sesión válida para vincular Google.",
    });
  }

  return res.status(200).json({
    url: buildGoogleAuthUrl("link", token),
  });
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const error = typeof req.query.error === "string" ? req.query.error : "";
  const state = decodeState(
    typeof req.query.state === "string" ? req.query.state : "",
  );

  if (error) {
    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "google",
        code: "GOOGLE_AUTH_FAILED",
        message: "La vinculación con Google fue cancelada o falló.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message: "La autenticación con Google fue cancelada o falló.",
    });
  }

  if (!code) {
    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "google",
        code: "GOOGLE_AUTH_FAILED",
        message: "Google no devolvió un código válido.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message: "Google no devolvió un código válido.",
    });
  }

  try {
    if (state?.mode === "link") {
      const result = await linkGoogleToCurrentUserByCodeService(
        state.sessionToken,
        code,
      );

      return sendPopupResponse(res, {
        type: "propbol:social-link-success",
        provider: "google",
        message: result.message,
        linkedEmail: result.linkedEmail,
      });
    }

    const mode = state?.mode === "register" ? "register" : "login";

    const result =
      mode === "register"
        ? await registerWithGoogleCodeService(code)
        : await loginWithGoogleCodeService(code);

    return sendPopupResponse(res, {
      type: "propbol:google-login-success",
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("[Google Auth Error]", error);

    if (error instanceof GoogleAuthError) {
      if (state?.mode === "link") {
        return sendPopupResponse(res, {
          type: "propbol:social-link-error",
          provider: "google",
          code: error.code,
          message: error.message,
        });
      }

      return sendPopupResponse(res, {
        type: "propbol:google-login-error",
        code: error.code,
        message: error.message,
      });
    }

    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "google",
        code: "GOOGLE_AUTH_FAILED",
        message: "No se pudo completar la vinculación con Google.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:google-login-error",
      code: "GOOGLE_AUTH_FAILED",
      message:
        state?.mode === "register"
          ? "No se pudo completar el registro con Google."
          : "No se pudo completar el inicio de sesión con Google.",
    });
  }
};
