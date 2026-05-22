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
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

export type GoogleLinkSuccess = {
  message: string;
  provider: "google";
  linkedEmail: string | null;
};

export type GoogleStatePayload =
  | {
      mode: "login" | "register";
    }
  | {
      mode: "link";
      sessionToken: string;
    };

export type GoogleLoginSuccess = {
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre: string;
    apellido: string;
    avatar?: string | null;
  };
};

export type GoogleAuthErrorCode =
  | "GOOGLE_AUTH_FAILED"
  | "ACCOUNT_NOT_REGISTERED"
  | "ACCOUNT_ALREADY_REGISTERED";

export class GoogleAuthError extends Error {
  code: GoogleAuthErrorCode;
  statusCode: number;

  constructor(message: string, code: GoogleAuthErrorCode, statusCode = 400) {
    super(message);
    this.name = "GoogleAuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
