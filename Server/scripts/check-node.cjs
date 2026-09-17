const [major, minor] = process.versions.node.split('.').map(Number);
if (!((major === 22 && minor >= 13) || major >= 24)) {
  console.error('Este proyecto necesita Node.js 22.13+ (rama 22) o Node.js 24+. Tu versión: ' + process.version);
  console.error('Actualizá Node.js y volvé a abrir la terminal. No necesitás instalar SQL Server.');
  process.exit(1);
}
