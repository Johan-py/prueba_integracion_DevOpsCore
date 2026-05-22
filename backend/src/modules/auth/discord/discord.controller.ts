import type { Request, Response } from "express";
import { env } from "../../../config/env.js";
import {
  linkDiscordToCurrentUserByCodeService,
  loginWithDiscordCodeService,
  registerWithDiscordCodeService,
} from "./discord.service.js";
import { DiscordAuthError } from "./discord.types.js";

type DiscordFlowMode = "login" | "register";

type DiscordStatePayload =
  | { mode: "login" | "register" }
  | { mode: "link"; sessionToken: string };

const encodeState = (value: DiscordStatePayload) => {
  return Buffer.from(JSON.stringify(value), "utf-8").toString("base64url");
};

const decodeState = (
  rawState: string | undefined,
): DiscordStatePayload | null => {
  if (!rawState?.trim()) return null;

  if (rawState === "login" || rawState === "register") {
    return { mode: rawState };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(rawState, "base64url").toString("utf-8"),
    ) as DiscordStatePayload;

    if (!parsed || typeof parsed !== "object" || !("mode" in parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildDiscordAuthUrl = (
  mode: DiscordFlowMode | "link",
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
    "https://discord.com/oauth2/authorize?" +
    new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_CALLBACK_URL,
      response_type: "code",
      scope: "identify email",
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
        type: "propbol:discord-login-success";
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
        type: "propbol:discord-login-error";
        code: string;
        message: string;
         }
    | {
        type: "propbol:social-link-success";
        provider: "discord";
        message: string;
        linkedEmail: string | null;
      }
    | {
        type: "propbol:social-link-error";
        provider: "discord";
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
      <title>Autenticación con Discord</title>
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

export const startDiscordLoginController = (_req: Request, res: Response) => {
  return res.redirect(buildDiscordAuthUrl("login"));
};

export const startDiscordRegisterController = (
  _req: Request,
  res: Response,
) => {
  return res.redirect(buildDiscordAuthUrl("register"));
};

export const getDiscordLinkUrlController = (req: Request, res: Response) => {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return res.status(401).json({
      message: "No se encontró una sesión válida para vincular Discord.",
    });
  }

  return res.status(200).json({
    url: buildDiscordAuthUrl("link", token),
  });
};

export const discordCallbackController = async (
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
        provider: "discord",
        code: "DISCORD_AUTH_FAILED",
        message: "La vinculación con Discord fue cancelada o falló.",
      });
    }
    return sendPopupResponse(res, {
      type: "propbol:discord-login-error",
      code: "DISCORD_AUTH_FAILED",
      message: "La autenticación con Discord fue cancelada o falló.",
    });
  }

  if (!code) {
    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "discord",
        code: "DISCORD_AUTH_FAILED",
        message: "Discord no devolvió un código válido.",
      });
    }
    return sendPopupResponse(res, {
      type: "propbol:discord-login-error",
      code: "DISCORD_AUTH_FAILED",
      message: "Discord no devolvió un código válido.",
    });
  }

  try {
     if (state?.mode === "link") {
      const result = await linkDiscordToCurrentUserByCodeService(
        state.sessionToken,
        code,
      );

      return sendPopupResponse(res, {
        type: "propbol:social-link-success",
        provider: "discord",
        message: result.message,
        linkedEmail: result.linkedEmail,
      });
    }

    const mode = state?.mode === "register" ? "register" : "login";
    const result =
      mode === "register"
        ? await registerWithDiscordCodeService(code)
        : await loginWithDiscordCodeService(code);

    return sendPopupResponse(res, {
      type: "propbol:discord-login-success",
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("[Discord Auth Error]", error);

    if (error instanceof DiscordAuthError) {
      if (state?.mode === "link") {
        return sendPopupResponse(res, {
          type: "propbol:social-link-error",
          provider: "discord",
          code: error.code,
          message: error.message,
        });
      }
      return sendPopupResponse(res, {
        type: "propbol:discord-login-error",
        code: error.code,
        message: error.message,
      });
    }

    if (state?.mode === "link") {
      return sendPopupResponse(res, {
        type: "propbol:social-link-error",
        provider: "discord",
        code: "DISCORD_AUTH_FAILED",
        message: "No se pudo completar la vinculación con Discord.",
      });
    }

    return sendPopupResponse(res, {
      type: "propbol:discord-login-error",
      code: "DISCORD_AUTH_FAILED",
      message:
          state?.mode === "register"
          ? "No se pudo completar el registro con Discord."
          : "No se pudo completar el inicio de sesión con Discord.",
    });
  }
};
