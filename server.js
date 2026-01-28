'use strict';

require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente.');
      
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

// Iniciar servidor
const startServer = async () => {
  await syncDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(error => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});



