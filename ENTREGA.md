# Entrega actualizada

- Se reemplazó SQL Server por SQLite en usuarios y productos.
- Se eliminaron `mssql`, sus tipos y la configuración anterior.
- Se crea la base y sus tablas automáticamente en `Server/data/registro.sqlite`.
- Se mantiene bcrypt con costo 12, registro, login y sesiones.
- En desarrollo se genera una clave local aleatoria para que no sea necesario editar `.env`.
- Se adaptaron los tests de modificar y eliminar a SQLite real, comprobando que no se alteren otros productos.
- Se mantienen el formulario y la tarjeta de productos con vista previa y validaciones.
- 23 tests aprobados; compilación y ESLint correctos.

Ver `Readme.md` para iniciar en Windows con `npm.cmd` y `AUTENTICACION.md` para la explicación de bcrypt.
