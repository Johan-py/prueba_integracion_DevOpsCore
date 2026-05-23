export type FacebookTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
};

export type FacebookUserInfo = {
  id?: string;
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type FacebookLinkSuccess = {
  message: string;
  provider: "facebook";
  linkedEmail: string | null;
};

export type FacebookStatePayload =
  | {
      mode: "login" | "register";
    }
  | {
      mode: "link";
      sessionToken: string;
    };

export type FacebookLoginSuccess = {
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

export type FacebookAuthErrorCode =
  | "FACEBOOK_AUTH_FAILED"
  | "ACCOUNT_NOT_REGISTERED"
  | "ACCOUNT_ALREADY_REGISTERED";

export class FacebookAuthError extends Error {
  code: FacebookAuthErrorCode;
  statusCode: number;

  constructor(message: string, code: FacebookAuthErrorCode, statusCode = 400) {
    super(message);
    this.name = "FacebookAuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
