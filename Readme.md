# Sistema de Registro — SQLite y bcrypt

Esta versión guarda la información en un archivo local. No requiere instalar SQL Server, crear bases manualmente, configurar puertos de base de datos ni proporcionar credenciales.

## Inicio en Windows

Extraer este ZIP en una carpeta nueva, para evitar mezclarlo con la versión anterior.
Se necesita Node.js 22.13 o posterior de la rama 22, o Node.js 24 o posterior. Comprobar con `node --version`.

Abrir una terminal en la carpeta principal del proyecto y ejecutar:

```powershell
cd Server
npm.cmd install
npm.cmd run dev
```

Abrir otra terminal en la carpeta principal y ejecutar:

```powershell
cd Client
npm.cmd install
npm.cmd run dev
```

Abrir http://localhost:5173 (o la URL que muestre Vite), elegir **Registrarme**, crear una cuenta e iniciar sesión. Dejar las dos terminales abiertas.

El backend escucha en el puerto 3000. Las tablas se crean automáticamente. No hay usuarios precargados ni contraseñas de ejemplo activas.

## Datos locales

- `Server/data/registro.sqlite`: usuarios y productos; se genera al iniciar.
- `Server/data/.jwt-secret`: clave de sesión aleatoria para desarrollo; se genera al iniciar sesión por primera vez y se conserva entre reinicios.
- No borrar `Server/data` si se quieren conservar los registros.
- Para copiar la información a otra PC, detener el backend y copiar la carpeta `Server/data` de forma privada junto con el proyecto.
- La nueva base empieza vacía: no se importan automáticamente datos de una instalación anterior de SQL Server.

La configuración incluida funciona sin editar `.env`. `SQLITE_PATH` permite elegir otro archivo. Si ya se usa el puerto 3000, debe liberarse o cambiarse tanto `PORT` del backend como el proxy en `Client/vite.config.ts`.

## Funciones

Registro con bcrypt, login, sesión JWT de una hora y protección de las rutas de productos. El formulario y tarjeta mantienen su vista previa local; no se agregó guardado de productos desde la interfaz. La API sí registra, modifica y elimina productos en SQLite.

## Pruebas

Desde `Server`: `npm.cmd test` y `npm.cmd run build`.
Desde `Client`: `npm.cmd run build` y `npm.cmd run lint`.

23 pruebas aprobadas con SQLite real, bcrypt real y peticiones HTTP. Se verifica persistencia desde otro proceso. Los tests crean bases temporales y no borran los datos personales.

Para detalles, ver `AUTENTICACION.md` y `ENTREGA.md`.
