import type { Request, Response } from "express";
import { env } from "../../../config/env.js";
import {
  linkFacebookToCurrentUserByCodeService,
  loginWithFacebookCodeService,
  registerWithFacebookCodeService,
} from "./facebook.service.js";
import {
  FacebookAuthError,
  type FacebookStatePayload,
} from "./facebook.types.js";

type FacebookFlowMode = "login" | "register";

const encodeState = (value: FacebookStatePayload) => {
  return Buffer.from(JSON.stringify(value), "utf-8").toString("base64url");
};

const decodeState = (
  rawState: string | undefined,
): FacebookStatePayload | null => {
  if (!rawState?.trim()) return null;

  if (rawState === "login" || rawState === "register") {
    return { mode: rawState };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(rawState, "base64url").toString("utf-8"),
    ) as FacebookStatePayload;

    if (!parsed || typeof parsed !== "object" || !("mode" in parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildFacebookAuthUrl = (
  mode: FacebookFlowMode | "link",
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
    "https://www.facebook.com/v25.0/dialog/oauth?" +
    new URLSearchParams({
      client_id: env.FACEBOOK_CLIENT_ID,
      redirect_uri: env.FACEBOOK_CALLBACK_URL,
      response_type: "code",
      scope: "email,public_profile",
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
        type: "propbol:facebook-login-success";
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
        type: "propbol:facebook-login-error";
        code: string;
        message: string;
      }
    | {
        type: "propbol:social-link-success";
        provider: "facebook";
        message: string;
        linkedEmail: string | null;
      }
    | {
        type: "propbol:social-link-error";
        provider: "facebook";
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
      <title>Autenticación con Facebook</title>
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

export const startFacebookLoginController = (_req: Request, res: Response) => {
  return res.redirect(buildFacebookAuthUrl("login"));
};

export const startFacebookRegisterController = (
  _req: Request,
  res: Response,
) => {
  return res.redirect(buildFacebookAuthUrl("register"));
};

export const getFacebookLinkUrlController = (req: Request, res: Response) => {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return res.status(401).json({
      message: "No se encontró una sesión válida para vincular Facebook.",
    });
  }

  return res.status(200).json({
    url: buildFacebookAuthUrl("link", token),
  });
};

export const facebookCallbackController = async (
  req: Request,
  res: Response,
) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const error = typeof req.query.error === "string" ? req.query.error : "";
  const state = decodeState(
    typeof req.query.state === "string" ? req.query.state : "",
  );

  if (error) {
    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "facebook",
        code: "FACEBOOK_AUTH_FAILED",
        message: "La vinculación con Facebook fue cancelada o falló.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:facebook-login-error",
      code: "FACEBOOK_AUTH_FAILED",
      message: "La autenticación con Facebook fue cancelada o falló.",
    });
  }

  if (!code) {
    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "facebook",
        code: "FACEBOOK_AUTH_FAILED",
        message: "Facebook no devolvió un código válido.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:facebook-login-error",
      code: "FACEBOOK_AUTH_FAILED",
      message: "Facebook no devolvió un código válido.",
    });
  }

  try {
    if (state?.mode === "link") {
      const result = await linkFacebookToCurrentUserByCodeService(
        state.sessionToken,
        code,
      );

      return sendPopupResponse(res, {
        type: "propbol:social-link-success",
        provider: "facebook",
        message: result.message,
        linkedEmail: result.linkedEmail,
      });
    }

    const mode = state?.mode === "register" ? "register" : "login";

    const result =
      mode === "register"
        ? await registerWithFacebookCodeService(code)
        : await loginWithFacebookCodeService(code);

    return sendPopupResponse(res, {
      type: "propbol:facebook-login-success",
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("[Facebook Auth Error]", error);

    if (error instanceof FacebookAuthError) {
      if (state?.mode === "link") {
        return sendPopupResponse(res, {
          type: "propbol:social-link-error",
          provider: "facebook",
          code: error.code,
          message: error.message,
        });
      }

      return sendPopupResponse(res, {
        type: "propbol:facebook-login-error",
        code: error.code,
        message: error.message,
      });
    }

    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "facebook",
        code: "FACEBOOK_AUTH_FAILED",
        message: "No se pudo completar la vinculación con Facebook.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:facebook-login-error",
      code: "FACEBOOK_AUTH_FAILED",
      message:
        state?.mode === "register"
          ? "No se pudo completar el registro con Facebook."
          : "No se pudo completar el inicio de sesión con Facebook.",
    });
  }
};
