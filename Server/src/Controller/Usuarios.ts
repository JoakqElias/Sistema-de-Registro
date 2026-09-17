import type { Request, Response } from 'express';
import { db } from '../Config/Database';
import { hashearPassword, passwordValida, verificarPassword } from '../Services/Password';
import { crearToken } from '../Services/Token';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
}

function normalizarEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function RegistrarUsuario(req: Request, res: Response) {
  const { nombre, email: emailIngresado, password } = req.body ?? {};
  const email = normalizarEmail(emailIngresado);
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100 || !email) {
    return res.status(400).json({ error: 'Ingresá un nombre y un correo electrónico válidos' });
  }
  if (!passwordValida(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes UTF-8' });
  }
  try {
    // Solo este hash llega al INSERT; la contraseña original nunca se almacena.
    const passwordHash = await hashearPassword(password);
    const usuario = db.prepare(`INSERT INTO Usuarios (nombre, email, password_hash)
      VALUES (?, ?, ?) RETURNING id, nombre, email`).get(nombre.trim(), email, passwordHash);
    return res.status(201).json({
      Mensaje: 'Usuario registrado. Ya podés iniciar sesión.',
      usuario,
    });
  } catch (error) {
    // La restricción UNIQUE también evita duplicados en registros simultáneos.
    const codigo = (error as { errcode?: number }).errcode;
    if (codigo === 2067) {
      return res.status(409).json({ error: 'No se pudo registrar ese correo electrónico' });
    }
    return res.status(500).json({ error: 'No se pudo registrar el usuario' });
  }
}

// Hash de comparación para usuarios inexistentes: evita omitir bcrypt en ese caso.
let hashDeComparacion: Promise<string> | undefined;
function obtenerHashDeComparacion(): Promise<string> {
  hashDeComparacion ??= hashearPassword('Comparacion-interna-sin-usuario');
  return hashDeComparacion;
}

export async function Login(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  const { email: emailIngresado, password } = req.body ?? {};
  const email = normalizarEmail(emailIngresado);
  if (!email || !passwordValida(password)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }
  try {
    const usuario = db.prepare('SELECT id, nombre, email, password_hash FROM Usuarios WHERE email = ?')
      .get(email) as unknown as Usuario | undefined;
    const hash = usuario?.password_hash ?? await obtenerHashDeComparacion();
    const coincide = await verificarPassword(password, hash);
    // Mismo mensaje para usuario inexistente y contraseña equivocada.
    if (!usuario || !coincide) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    const token = crearToken(usuario.id);
    return res.status(200).json({
      Mensaje: 'Inicio de sesión correcto', token, expiresIn: 3600,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch {
    return res.status(500).json({ error: 'No se pudo iniciar sesión. Revisá la configuración del servidor.' });
  }
}

export async function UsuarioActual(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const usuario = db.prepare('SELECT id, nombre, email FROM Usuarios WHERE id = ?')
      .get(res.locals.usuarioId);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no disponible' });
    }
    return res.json({ usuario });
  } catch {
    return res.status(500).json({ error: 'No se pudo consultar el usuario' });
  }
}
