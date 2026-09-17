import { db } from '../Config/Database';
import type { Request, Response } from 'express';

function datos(req: Request) {
  const { codigo, nombre, descripcion, talle, precio, stock, imagen } = req.body ?? {};
  if (typeof codigo !== 'string' || !codigo.trim() || typeof nombre !== 'string' || !nombre.trim()) return null;
  return [codigo, nombre, descripcion ?? null, talle ?? null, precio ?? 0, stock ?? 0, imagen ?? null];
}

export async function RegistrarProductos(req: Request, res: Response) {
  try {
    const valores = datos(req);
    if (!valores) return res.status(400).json({ Mensaje: 'Debe Completar los campos de Codigo y Nombre para continuar' });
    db.prepare('INSERT INTO Tarjetas (codigo,nombre,descripcion,talle,precio,stock,imagen) VALUES (?,?,?,?,?,?,?)').run(...valores);
    return res.status(201).json({ Mensaje: 'Productos Registrado ✅' });
  } catch {
    return res.status(500).json({ error: 'Error al Cargar la Base de Datos' });
  }
}

export async function ModificarProducto(req: Request, res: Response) {
  try {
    const valores = datos(req);
    if (!valores) return res.status(400).json({ Mensaje: 'Debe Completar los campos de Codigo y Nombre para continuar' });
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Debe Ingresar un ID para continuar' });
    const resultado = db.prepare(`UPDATE Tarjetas SET codigo=?, nombre=?, descripcion=?, talle=?, precio=?, stock=?, imagen=? WHERE id=?`).run(...valores, id);
    if (resultado.changes === 0) return res.status(404).json({ error: 'No se Logro Encontrar el Producto' });
    return res.status(201).json({ Mensaje: 'Productos Modificados Correctamente ✅' });
  } catch {
    return res.status(500).json({ error: 'Error al Cargar la Base de Datos' });
  }
}

export async function EliminarProducto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Debe Ingresar un ID para continuar' });
    const resultado = db.prepare('DELETE FROM Tarjetas WHERE id=?').run(id);
    if (resultado.changes === 0) return res.status(404).json({ error: 'No se Logro Encontrar el Producto' });
    return res.status(201).json({ Mensaje: 'Productos Eliminados Correctamente ✅' });
  } catch {
    return res.status(500).json({ error: 'Error al Cargar la Base de Datos' });
  }
}
