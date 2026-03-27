import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateToken = (payload: { id: number; correo: String }) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as {
    id: number;
    correo: string;
    iat: number;
    exp: number;
  };
};
