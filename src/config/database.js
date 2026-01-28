const { Sequelize } = require("sequelize");

const dbPort = parseInt(process.env.DB_PORT) || 5434;
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Configuración de base de datos:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${dbPort}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      connectTimeout: 10000,
      statement_timeout: 30000,
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, // Tiempo máximo para obtener conexión del pool
      idle: 10000 // Tiempo máximo que una conexión puede estar idle
    },
    retry: {
      max: 3 // Intentar reconectar hasta 3 veces
    }
  }
);

module.exports = sequelize;