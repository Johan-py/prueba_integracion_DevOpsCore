import type { Request, Response } from "express";
import {
  AuthError,
  activate2FAService,
  deactivate2FAService,
  forgotPasswordService,
  get2FAStatusService,
  getMeService,
  loginService,
  logoutService,
  registerUser,
  resetPasswordService,
  verify2FAService,
  verifyRegisterCodeService,
  resend2FAService,
  requestMagicLinkService,
  loginWithMagicLinkService,
  resendMagicLinkService,
  activateAccountByPasswordService,
  requestActivationCodeService,
  activateAccountByCodeService,
  resendRegisterCodeService,
} from "./auth.service.js";

type RegisterBody = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
};

type VerifyRegisterBody = {
  verificationToken: string;
  codigo: string;
  password: string;
};

type Verify2FABody = {
  userId: number;
  codigo: string;
};

type VerifyPasswordBody = {
  password: string;
};

type RequestMagicLinkBody = {
  correo: string;
};

type LoginWithMagicLinkBody = {
  token: string;
};

const isDuplicateEmailError = (message: string) => {
  const normalized = message.toLowerCase();

  return (
    normalized === "el correo ya está registrado" ||
    (normalized.includes("unique constraint failed") &&
      normalized.includes("correo"))
  );
};

const getRegisterErrorStatus = (message: string) => {
  if (isDuplicateEmailError(message)) return 409;
  return 400;
};

const getRegisterErrorMessage = (message: string) => {
  if (isDuplicateEmailError(message)) {
    return "El correo ya está registrado";
  }

  return message;
};

export const resend2FAController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const result = await resend2FAService(userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al reenviar el código 2FA";

    return res.status(400).json({ message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body;
    const result = await loginService({ correo, password });

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.retryAfterSeconds) {
        res.setHeader("Retry-After", String(error.retryAfterSeconds));
      }

      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return res.status(400).json({ message });
  }
};

export const registerController = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response,
) => {
  try {
    const { nombre, apellido, correo, password, confirmPassword, telefono } =
      req.body;

    const result = await registerUser({
      nombre,
      apellido,
      correo,
      password,
      confirmPassword,
      telefono,
    });

    return res.status(200).json({
      message: "Te enviamos un código de verificación a tu correo.",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return res.status(getRegisterErrorStatus(message)).json({
      message: getRegisterErrorMessage(message),
    });
  }
};

export const verifyRegisterCodeController = async (
  req: Request<unknown, unknown, VerifyRegisterBody>,
  res: Response,
) => {
  try {
    const { verificationToken, codigo, password } = req.body;

    const result = await verifyRegisterCodeService({
      verificationToken,
      codigo,
      password,
    });

    return res.status(201).json({
      message: "Correo verificado y usuario creado correctamente",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error al verificar código";

    return res.status(400).json({ message });
  }
};

export const verify2FAController = async (
  req: Request<unknown, unknown, Verify2FABody>,
  res: Response,
) => {
  try {
    const { userId, codigo } = req.body;

    const result = await verify2FAService({
      userId,
      codigo,
    });

    return res.status(200).json({
      message: "Verificación 2FA exitosa",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error al verificar código 2FA";

    return res.status(400).json({ message });
  }
};

export const getMeController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token no proporcionado",
    });
  }

  try {
    const result = await getMeService(token);

    return res.status(200).json({
      message: "Sesión válida",
      ...result,
    });
  } catch (error) {
    // ✅ Si es AuthError (ej: cuenta desactivada = 403), reenviar el status correcto
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Sesión inválida o expirada";

    return res.status(401).json({ message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const result = await logoutService(token);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cerrar sesión";
    return res.status(400).json({ message });
  }
};

export const activate2FAController = async (
  req: Request<unknown, unknown, VerifyPasswordBody>,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const result = await activate2FAService({
      userId,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al activar la verificación en dos pasos";

    return res.status(400).json({ message });
  }
};

export const deactivate2FAController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const result = await deactivate2FAService(userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al desactivar la verificación en dos pasos";

    return res.status(400).json({ message });
  }
};

export const get2FAStatusController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const result = await get2FAStatusService(userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener el estado de la verificación en dos pasos";

    return res.status(400).json({ message });
  }
};

export const requestMagicLinkController = async (
  req: Request<unknown, unknown, RequestMagicLinkBody>,
  res: Response,
) => {
  try {
    const result = await requestMagicLinkService(req.body);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error al solicitar link mágico";

    return res.status(400).json({ message });
  }
};

export const resendMagicLinkController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await resendMagicLinkService(req.body);
    const { message: _message, ...responseData } = result;

    return res.status(200).json({
      message: "Te reenviamos un link mágico a tu correo electrónico.",
      ...responseData,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.retryAfterSeconds) {
        res.setHeader("Retry-After", String(error.retryAfterSeconds));
      }

      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error al reenviar link mágico";

    return res.status(400).json({ message });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const result = await forgotPasswordService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Error al solicitar recuperación de contraseña",
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const result = await resetPasswordService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    const message =
      error instanceof Error
        ? error.message
        : "Error al restablecer contraseña";
    return res.status(400).json({ message });
  }
};

export const activateAccountByPasswordController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { correo, password } = req.body;
    const result = await activateAccountByPasswordService({ correo, password });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error inesperado al activar cuenta por contraseña:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const requestActivationCodeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { correo } = req.body;
    const result = await requestActivationCodeService(correo);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error inesperado al solicitar código de activación:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const activateAccountByCodeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { correo, codigo } = req.body;
    const result = await activateAccountByCodeService(correo, codigo);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error inesperado al activar cuenta por código:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const resendRegisterCodeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { verificationToken } = req.body;
    const result = await resendRegisterCodeService(verificationToken);

    return res.status(200).json({
      message: "Te enviamos un nuevo código de verificación.",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : "Error al reenviar el código";

    return res.status(400).json({ message });
  }
};

export const loginWithMagicLinkController = async (
  req: Request<unknown, unknown, LoginWithMagicLinkBody>,
  res: Response,
) => {
  try {
    const result = await loginWithMagicLinkService(req.body);

    return res.status(200).json({
      message: "Inicio de sesión con Magic Link exitoso",
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión con Magic Link";

    return res.status(400).json({ message });
  }
};
