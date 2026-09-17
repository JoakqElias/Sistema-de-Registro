# Autenticación con bcrypt y SQLite

## Hasheo y verificación

`Server/src/Services/Password.ts` utiliza `await bcrypt.hash(password, 12)` antes de guardar el usuario. Cada hash incluye una sal aleatoria. La base almacena únicamente `password_hash`.

El login busca el correo con una consulta parametrizada y utiliza `await bcrypt.compare(password, hash)`. Si no coincide, devuelve 401; si coincide, devuelve un token JWT y los datos públicos. No devuelve el hash ni la contraseña. Se conserva el límite de 8 caracteres como mínimo y 72 bytes UTF-8 como máximo.

## Base de datos automática

`Server/src/Config/Database.ts` utiliza `node:sqlite` y crea las tablas `Usuarios` y `Tarjetas` con `CREATE TABLE IF NOT EXISTS`. Todas las consultas con datos del usuario usan parámetros. La columna `email` es única. No es necesario ejecutar scripts SQL externos.

Los datos se guardan en `Server/data/registro.sqlite` y siguen disponibles después de reiniciar el servidor. Una nueva extracción empieza sin cuentas: primero registrarse.

## Rutas

| Método | Ruta | Datos |
| --- | --- | --- |
| POST | `/api/auth/registro` | JSON con `nombre`, `email`, `password` |
| POST | `/api/auth/login` | JSON con `email`, `password` |
| GET | `/api/auth/me` | Cabecera `Authorization: Bearer <token>` |
| POST | `/api/Registrar` | Token y JSON de producto |
| PUT | `/api/Modificar/:id` | Token y JSON de producto |
| DELETE | `/api/Eliminar/:id` | Token |

Las rutas de productos requieren un token válido. El formulario de productos sigue siendo una vista previa local, como en la entrega inicial.

## Sesión

`Server/src/Services/Token.ts` firma y verifica tokens de una hora. En desarrollo genera automáticamente una clave aleatoria por instalación, persistida en `Server/data/.jwt-secret`. No hay una clave fija compartida en el código. Una variable `JWT_SECRET` explícita tiene prioridad y debe tener al menos 32 bytes.

El cliente mantiene el token en memoria: recargar o cerrar sesión requiere volver a iniciar sesión. Cerrar sesión no revoca una copia externa del token, que vence al cumplirse una hora.

Para producción es obligatorio configurar `JWT_SECRET`; no se genera una clave local automáticamente en ese modo. La entrega está orientada al ejercicio local; una publicación requiere HTTPS y limitación de intentos. No incluye recuperación de contraseña ni verificación de correo.

## Verificación

23 pruebas aprobadas: 12 de autenticación, API y persistencia; 11 de modificación y eliminación de productos. Se usa SQLite real en archivos temporales o memoria, bcrypt real y JWT real. Las pruebas de errores simulan únicamente el fallo de la consulta. La persistencia se comprueba abriendo la base y verificando un token desde otro proceso.

Compilación de backend y frontend y ESLint correctos. No se realizó una nueva verificación visual en navegador.

Referencias: [bcrypt](https://github.com/kelektiv/node.bcrypt.js), [SQLite integrado en Node.js](https://nodejs.org/api/sqlite.html).
