import { Router } from "express";
import {RegistrarProductos,ModificarProducto,EliminarProducto}from '../Controller/Productos'

const Rutas=Router()

Rutas.post('/Registrar',RegistrarProductos)
Rutas.put('/Modificar/:id',ModificarProducto)
Rutas.delete('/Eliminar/:id',EliminarProducto)


export default Rutas