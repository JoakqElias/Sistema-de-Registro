import { Router } from 'express';
import { RegistrarUsuario, Login, UsuarioActual } from '../Controller/Usuarios';
import { requerirAutenticacion } from '../Middleware/Autenticacion';

const Usuarios = Router();
Usuarios.post('/registro', RegistrarUsuario);
Usuarios.post('/login', Login);
Usuarios.get('/me', requerirAutenticacion, UsuarioActual);

export default Usuarios;
