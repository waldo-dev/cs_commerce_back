'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Función para probar conexión
async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...\n');
  console.log('Configuración:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'chilsmart_commerce'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Password: ${process.env.DB_PASS ? '***' : '(vacío)'}\n`);

  const sequelize = new Sequelize(
    process.env.DB_NAME || 'chilsmart_commerce',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5434,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ ¡Conexión exitosa! La base de datos está configurada correctamente.\n');
    
    // Verificar si la base de datos existe
    const [results] = await sequelize.query("SELECT current_database()");
    console.log(`📊 Base de datos conectada: ${results[0].current_database}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:\n');
    
    if (error.original) {
      console.error(`   Código: ${error.original.code}`);
      console.error(`   Mensaje: ${error.original.message}\n`);
      
      if (error.original.code === '28P01') {
        console.log('💡 Solución: La contraseña es incorrecta.');
        console.log('   Opciones:');
        console.log('   1. Deja DB_PASS= vacío en tu .env si no usas contraseña');
        console.log('   2. O resetea la contraseña de PostgreSQL (ver README)\n');
      } else if (error.original.code === '3D000') {
        console.log('💡 Solución: La base de datos no existe.');
        console.log('   Crea la base de datos con: CREATE DATABASE chilsmart_commerce;\n');
      } else if (error.original.code === 'ECONNREFUSED') {
        console.log('💡 Solución: PostgreSQL no está corriendo.');
        console.log('   Inicia el servicio de PostgreSQL.\n');
      }
    } else {
      console.error(`   ${error.message}\n`);
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

testConnection();



