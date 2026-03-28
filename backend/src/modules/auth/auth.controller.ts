import { loginService } from "./auth.service.js";

import { Request, Response } from "express";
import { registerUser } from "./auth.service.js";
export const registerController = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, correo, password, confirmPassword, telefono } =
      req.body;

    const user = await registerUser({
      nombre,
      apellido,
      correo,
      password,
      confirmPassword,
      telefono,
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return res.status(400).json({
      message,
    });
  }
};

type LoginBody = {
  email: string;
  password: string;
};

export const loginController = async (body: LoginBody) => {
  return loginService(body);
};
