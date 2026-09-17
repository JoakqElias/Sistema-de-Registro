import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';

export const serverRoot = resolve(__dirname, '../..');
dotenv.config({ path: resolve(serverRoot, '.env') });
export const databasePath = process.env.SQLITE_PATH === ':memory:'
  ? ':memory:' : resolve(serverRoot, process.env.SQLITE_PATH || 'data/registro.sqlite');
if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
export const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS Tarjetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    talle TEXT,
    precio REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen TEXT
  );
`);
