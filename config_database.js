const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Neon/AWS en algunos entornos
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error adquiriendo cliente de base de datos', err.stack);
  }
  console.log('📊 Base de datos: Conectado exitosamente a Neon.tech');
  release();
});

module.exports = pool;