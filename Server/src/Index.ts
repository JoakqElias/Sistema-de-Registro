import express from 'express';
import { databasePath } from './Config/Database';
import Rutas from './Router/Productos.route'
import Usuarios from './Router/Usuarios.route';
import { requerirAutenticacion } from './Middleware/Autenticacion';
// Carga las variables de entorno del .env


// Crea la aplicacion Express
const app = express();

// Middleware para leer JSON en el body de las peticiones
app.use(express.json({ limit: '16kb' }));

// Configura el puerto (del .env o 3000 por defecto)
const PORT = parseInt(process.env.PORT || '3000', 10);


app.use('/api/auth', Usuarios);
app.use('/api', requerirAutenticacion, Rutas);

// Levanta el servidor
app.listen(PORT, () => {
  console.log(`SQLite listo: ${databasePath}`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
