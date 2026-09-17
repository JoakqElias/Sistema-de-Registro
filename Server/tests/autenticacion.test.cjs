const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');
const carpeta = mkdtempSync(join(tmpdir(), 'registro-test-'));
process.env.SQLITE_PATH = join(carpeta, 'registro.sqlite');
process.env.JWT_SECRET_FILE = join(carpeta, 'clave');
delete process.env.JWT_SECRET;
process.env.NODE_ENV = 'test';
require('ts-node/register');
const { db } = require('../src/Config/Database.ts');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const rutas = require('../src/Router/Usuarios.route.ts').default;
const productos = require('../src/Router/Productos.route.ts').default;
const { requerirAutenticacion } = require('../src/Middleware/Autenticacion.ts');
const { hashearPassword, verificarPassword, passwordValida } = require('../src/Services/Password.ts');
const { crearToken } = require('../src/Services/Token.ts');
const datos = { nombre: 'Persona de prueba', email: 'persona@example.com', password: 'Clave-segura-2026' };
let servidor, base, hash;
before(async () => {
  hash = await hashearPassword(datos.password);
  const app = express(); app.use(express.json());
  app.use('/api/auth', rutas); app.use('/api', requerirAutenticacion, productos);
  servidor = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${servidor.address().port}`;
});
beforeEach(() => { db.exec('DELETE FROM Usuarios; DELETE FROM Tarjetas;'); });
after(async () => {
  await new Promise(resolve => servidor.close(resolve)); db.close(); rmSync(carpeta, { recursive: true, force: true });
});
async function post(ruta, body) {
  const r = await fetch(`${base}/api/auth/${ruta}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
}
function sembrar() {
  return Number(db.prepare('INSERT INTO Usuarios (nombre,email,password_hash) VALUES (?,?,?)').run(datos.nombre, datos.email, hash).lastInsertRowid);
}
test('bcrypt: sal aleatoria, costo 12, contraseña correcta e incorrecta', async () => {
  const otro = await hashearPassword(datos.password);
  assert.notEqual(hash, otro); assert.equal(bcrypt.getRounds(hash), 12);
  assert.equal(await verificarPassword(datos.password, hash), true);
  assert.equal(await verificarPassword('Equivocada', hash), false);
});
test('bcrypt: rechaza contraseñas mayores de 72 bytes', async () => {
  assert.equal(passwordValida('a'.repeat(72)), true);
  assert.equal(passwordValida('é'.repeat(37)), false);
  await assert.rejects(hashearPassword('a'.repeat(73)));
});
test('Registro y login completos con SQLite real, sin configurar secretos', async () => {
  const registro = await post('registro', { ...datos, email: ' PERSONA@EXAMPLE.COM ' });
  assert.equal(registro.status, 201);
  const usuario = db.prepare('SELECT * FROM Usuarios WHERE email=?').get(datos.email);
  assert.equal(await bcrypt.compare(datos.password, usuario.password_hash), true);
  assert.equal('password' in usuario, false); assert.equal('password_hash' in registro.body.usuario, false);
  const login = await post('login', datos);
  assert.equal(login.status, 200); assert.equal('password_hash' in login.body.usuario, false);
  const payload = jwt.decode(login.body.token); assert.equal(payload.exp - payload.iat, 3600);
  const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${login.body.token}` } });
  assert.equal(me.status, 200); assert.equal((await me.json()).usuario.email, datos.email);
});
test('Registro: correo duplicado devuelve 409', async () => {
  sembrar(); assert.equal((await post('registro', datos)).status, 409);
  assert.equal(db.prepare('SELECT count(*) AS n FROM Usuarios').get().n, 1);
});
test('Registro: valida nombre, correo y contraseña', async () => {
  for (const body of [{}, { ...datos, nombre: ' ' }, { ...datos, email: 'mal' }, { ...datos, password: 'corta' }, { ...datos, password: 12345678 }, { ...datos, password: 'é'.repeat(37) }]) {
    assert.equal((await post('registro', body)).status, 400);
  }
  assert.equal(db.prepare('SELECT count(*) AS n FROM Usuarios').get().n, 0);
});
test('Login: mismo 401 para contraseña incorrecta y usuario inexistente', async () => {
  sembrar(); const a = await post('login', { ...datos, password: 'Equivocada' });
  const b = await post('login', { ...datos, email: 'nadie@example.com' });
  assert.equal(a.status, 401); assert.deepEqual(a, b);
});
test('Login: entradas malformadas no emiten tokens', async () => {
  for (const body of [{}, { email: [], password: {} }, { ...datos, password: 'a'.repeat(73) }]) {
    const r = await post('login', body); assert.equal(r.status, 401); assert.equal('token' in r.body, false);
  }
});
test('Consultas parametrizadas: el correo no permite inyección SQL', async () => {
  sembrar(); assert.equal((await post('login', { ...datos, email: "x'OR'1'='1@example.com" })).status, 401);
  assert.equal(db.prepare('SELECT count(*) AS n FROM Usuarios').get().n, 1);
});
test('Sesión: productos bloqueados sin token o con token inválido', async () => {
  for (const token of ['', 'invalido', jwt.sign({}, 'otra-clave', { expiresIn: -1 })]) {
    const r = await fetch(`${base}/api/Eliminar/1`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    assert.equal(r.status, 401);
  }
});
test('Productos: alta, modificación y eliminación por HTTP con SQLite real', async () => {
  const token = crearToken(sembrar());
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const body = { codigo: 'A', nombre: 'Producto', precio: 15, stock: 2 };
  assert.equal((await fetch(`${base}/api/Registrar`, { method: 'POST', headers, body: JSON.stringify(body) })).status, 201);
  const id = db.prepare('SELECT id FROM Tarjetas').get().id;
  assert.equal((await fetch(`${base}/api/Modificar/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...body, precio: 20 }) })).status, 201);
  assert.equal(db.prepare('SELECT precio FROM Tarjetas WHERE id=?').get(id).precio, 20);
  assert.equal((await fetch(`${base}/api/Eliminar/${id}`, { method: 'DELETE', headers })).status, 201);
  assert.equal(db.prepare('SELECT count(*) AS n FROM Tarjetas').get().n, 0);
});
test('Persistencia: otro proceso lee usuario y valida token tras reiniciar', async () => {
  const id = sembrar(); const token = crearToken(id);
  const r = spawnSync(process.execPath, ['-r', 'ts-node/register', '-e', `
    const assert = require('node:assert/strict');
    const { db } = require('./src/Config/Database.ts');
    const { verificarToken } = require('./src/Services/Token.ts');
    assert.equal(db.prepare('SELECT email FROM Usuarios WHERE id=?').get(${id}).email, 'persona@example.com');
    assert.equal(verificarToken(${JSON.stringify(token)}), ${id});
    db.close();
  `], { cwd: require('node:path').resolve(__dirname, '..'), env: process.env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});
test('Errores de SQLite devuelven 500 sin filtrar detalles', async t => {
  sembrar(); const m = t.mock.method(db, 'prepare', () => { throw Error('Detalle privado'); });
  for (const ruta of ['registro', 'login']) {
    const r = await post(ruta, datos); assert.equal(r.status, 500); assert.equal(JSON.stringify(r.body).includes('Detalle privado'), false);
  }
  m.mock.restore();
});
