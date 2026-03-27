import { generateToken } from "../../utils/jwt.js";
import { findUser } from "./auth.repository.js";

export const loginService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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
