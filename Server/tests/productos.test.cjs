const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.SQLITE_PATH = ':memory:';
require('ts-node/register');
const { db } = require('../src/Config/Database.ts');
const { ModificarProducto, EliminarProducto } = require('../src/Controller/Productos.ts');
beforeEach(() => db.exec("DELETE FROM Tarjetas; INSERT INTO Tarjetas (id,codigo,nombre,precio,stock) VALUES (1,'A','Original',10,2),(2,'B','Otro',20,3);"));
after(() => db.close());
async function ejecutar(controller, params = { id: '1' }, body = { codigo: 'C', nombre: 'Modificado', precio: 50, stock: 8 }) {
  const res = { statusCode: 200, body: null, status(n) { this.statusCode=n; return this; }, json(v) { this.body=v; return this; } };
  await controller({ params, body }, res); return res;
}
test('Modificar: persiste todos los campos y no altera otro producto', async () => {
  const body = { codigo:'C', nombre:"Remera ' especial", descripcion:'Algodón', talle:'M', precio:12500.5, stock:8, imagen:'https://example.com/a.jpg' };
  assert.equal((await ejecutar(ModificarProducto, {id:'1'}, body)).statusCode, 201);
  assert.deepEqual({ ...db.prepare('SELECT * FROM Tarjetas WHERE id=1').get() }, {id:1,...body});
  assert.equal(db.prepare('SELECT nombre FROM Tarjetas WHERE id=2').get().nombre, 'Otro');
});
for (const campo of ['codigo','nombre']) test(`Modificar: ${campo} vacío devuelve 400`, async () => {
  assert.equal((await ejecutar(ModificarProducto, {id:'1'}, {codigo:'C',nombre:'Nuevo',[campo]:''})).statusCode, 400);
  assert.equal(db.prepare('SELECT nombre FROM Tarjetas WHERE id=1').get().nombre,'Original');
});
test('Modificar: valores por defecto', async () => {
  assert.equal((await ejecutar(ModificarProducto,{id:'1'},{codigo:'C',nombre:'Nuevo'})).statusCode,201);
  const r=db.prepare('SELECT * FROM Tarjetas WHERE id=1').get();
  assert.equal(r.precio,0); assert.equal(r.stock,0); assert.equal(r.imagen,null);
});
test('Eliminar: solo elimina el ID indicado', async () => {
  assert.equal((await ejecutar(EliminarProducto)).statusCode,201);
  assert.equal(db.prepare('SELECT * FROM Tarjetas WHERE id=1').get(),undefined);
  assert.equal(db.prepare('SELECT count(*) AS n FROM Tarjetas').get().n,1);
});
for(const [nombre,controller] of [['Modificar',ModificarProducto],['Eliminar',EliminarProducto]]) {
  test(`${nombre}: ID ausente o inválido devuelve 400`,async()=>{
    for(const params of [{},{id:'abc'},{id:'0'},{id:'1 OR 1=1'}]) assert.equal((await ejecutar(controller,params)).statusCode,400);
  });
  test(`${nombre}: inexistente devuelve 404`,async()=>{ assert.equal((await ejecutar(controller,{id:'999'})).statusCode,404); });
  test(`${nombre}: error de base devuelve 500`,async t=>{
    const m=t.mock.method(db,'prepare',()=>{throw Error('Fallo simulado')});
    assert.equal((await ejecutar(controller)).statusCode,500);m.mock.restore();
  });
}
