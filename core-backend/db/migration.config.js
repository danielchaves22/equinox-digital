console.log('Arquivo de configuração sendo carregado...');
console.log('__dirname:', __dirname);
console.log('Caminho das migrations configurado:', './db/migrations');

// core-backend/db/config.js
module.exports = {
    driver: 'pg',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'senha',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'zenit',
    schema: 'core',
    dir: './db/migrations',
    count: Infinity,
    'create-schema': true,
    'migration-table-name': 'core_migrations',
    verbose: true
  };