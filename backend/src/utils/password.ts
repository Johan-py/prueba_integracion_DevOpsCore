import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hashea una contraseña usando scrypt
 * @param password - Contraseña en texto plano
 * @returns Hash en formato: salt.hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}.${derivedKey.toString('hex')}`;
};

/**
 * Compara una contraseña con su hash
 * @param password - Contraseña en texto plano
 * @param hashedPassword - Hash en formato: salt.hash
 * @returns true si coinciden, false si no
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const [salt, hash] = hashedPassword.split('.');
  
  if (!salt || !hash) {
    return false;
  }
  
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const hashBuffer = Buffer.from(hash, 'hex');
  
  return timingSafeEqual(derivedKey, hashBuffer);
};
