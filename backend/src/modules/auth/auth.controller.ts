import { Request, Response } from "express";
import {
  AuthError,
  loginService,
  logoutService,
  registerUser,
  verifyRegisterCodeService,
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

    return res.status(400).json({ message });
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

export const logoutController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const result = await logoutService(token);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cerrar sesión";
    return res.status(400).json({ message });
  }
};
