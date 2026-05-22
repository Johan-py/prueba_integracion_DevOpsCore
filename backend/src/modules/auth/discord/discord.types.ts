export type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type DiscordUserInfo = {
  id?: string;
  username?: string;
  global_name?: string;
  email?: string;
  verified?: boolean;
  avatar?: string;
};

export type DiscordLoginSuccess = {
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

export type DiscordAuthErrorCode =
  | "DISCORD_AUTH_FAILED"
  | "ACCOUNT_NOT_REGISTERED"
  | "ACCOUNT_ALREADY_REGISTERED";

export class DiscordAuthError extends Error {
  code: DiscordAuthErrorCode;
  statusCode: number;

  constructor(message: string, code: DiscordAuthErrorCode, statusCode = 400) {
    super(message);
    this.name = "DiscordAuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
