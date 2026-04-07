export type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type GoogleUserInfo = {
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

export type GoogleLoginSuccess = {
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre: string;
    apellido: string;
  };
};

export class GoogleAuthError extends Error {
  code: "GOOGLE_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED";
  statusCode: number;

  constructor(
    message: string,
    code: "GOOGLE_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED",
    statusCode = 400,
  ) {
    super(message);
    this.name = "GoogleAuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
