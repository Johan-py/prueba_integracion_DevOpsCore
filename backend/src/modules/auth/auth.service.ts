import { generateToken } from "../../utils/jwt.js";
import { findUser, createUser, findUserByCorreo } from "./auth.repository.js";
import { Prisma } from "@prisma/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const onlyNumbersRegex = /^[0-9]+$/;
const DEFAULT_USER_ROLE_ID = 2;

export const loginService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {

if (!email || !password) {
  throw new Error("Correo y contraseña son obligatorios");
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  throw new Error("Formato de correo inválido");
}

  const user = await findUser(email);

  if (!user) {
    throw new Error("User not found");
  }

  const trimmedPassword = password.trim();

  const isValidPassword = user.password === trimmedPassword;

  if (!isValidPassword) {
    throw new Error("Invalid Credentials");
  }

  const token = generateToken(user);

  return { user, token };
};

export interface RegisterUserInput {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
}

export const registerUser = async (data: RegisterUserInput) => {
  const nombre = data.nombre.trim();
  const apellido = data.apellido.trim();
  const correo = data.correo.trim().toLowerCase();
  const password = data.password.trim();
  const confirmPassword = data.confirmPassword.trim();
  const telefono = data.telefono?.trim();

  if (!nombre || !apellido || !correo || !password || !confirmPassword) {
    throw new Error("Todos los campos obligatorios deben estar completos");
  }

  if (!emailRegex.test(correo)) {
    throw new Error("El formato del correo no es correcto");
  }

  if (!onlyLettersRegex.test(nombre)) {
    throw new Error("El nombre solo debe contener letras");
  }

  if (!onlyLettersRegex.test(apellido)) {
    throw new Error("El apellido solo debe contener letras");
  }

  if (telefono && !onlyNumbersRegex.test(telefono)) {
    throw new Error("El teléfono solo permite números");
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('La contraseña debe tener al menos una mayúscula y un número')
  }

  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden')
  }
  
  const existingUser = await findUserByCorreo(correo);

  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  try {
    return await createUser({
      nombre,
      apellido,
      correo,
      password,
      telefono,
      rolId: DEFAULT_USER_ROLE_ID,
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("El correo ya está registrado");
    }

    throw error;
  }
};
