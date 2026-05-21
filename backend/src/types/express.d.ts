declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      correo?: string;
    };
  }
}
