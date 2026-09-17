import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { serverRoot } from '../Config/Database';

let secretoLocal: string | undefined;

const ISSUER = 'sistema-registro';
const AUDIENCE = 'sistema-registro-client';

function obtenerSecreto(): string {
  if (process.env.JWT_SECRET) {
    if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) throw new Error('JWT_SECRET debe tener al menos 32 bytes');
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Configurar JWT_SECRET en producción');
  if (!secretoLocal) {
    const archivo = resolve(serverRoot, process.env.JWT_SECRET_FILE || 'data/.jwt-secret');
    mkdirSync(dirname(archivo), { recursive: true });
    try {
      writeFileSync(archivo, randomBytes(48).toString('hex'), { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    secretoLocal = readFileSync(archivo, 'utf8').trim();
    if (Buffer.byteLength(secretoLocal, 'utf8') < 32) throw new Error('Clave de sesión local inválida');
  }
  return secretoLocal;
}

export function crearToken(id: number): string {
  return jwt.sign({}, obtenerSecreto(), {
    algorithm: 'HS256', subject: String(id), expiresIn: '1h',
    issuer: ISSUER, audience: AUDIENCE,
  });
}

export function verificarToken(token: string): number {
  const payload = jwt.verify(token, obtenerSecreto(), {
    algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE,
  });
  if (typeof payload === 'string' || !payload.sub || !/^\d+$/.test(payload.sub)) {
    throw new Error('Token inválido');
  }
  const id = Number(payload.sub);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Token inválido');
  return id;
}
