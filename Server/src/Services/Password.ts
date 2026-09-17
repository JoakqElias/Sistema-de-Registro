import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function passwordValida(password: unknown): password is string {
  // bcrypt admite hasta 72 bytes, no necesariamente 72 caracteres.
  return typeof password === 'string'
    && password.length >= 8
    && Buffer.byteLength(password, 'utf8') <= 72;
}

export async function hashearPassword(password: string): Promise<string> {
  if (!passwordValida(password)) throw new Error('Contraseña inválida');
  // bcrypt genera automáticamente una sal aleatoria para cada usuario.
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verificarPassword(password: string, hash: string): Promise<boolean> {
  if (!passwordValida(password)) return false;
  return bcrypt.compare(password, hash);
}
