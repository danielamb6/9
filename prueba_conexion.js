const { testConnection } = require('./config/database');

async function test() {
    console.log('🔍 Probando conexión a PostgreSQL...');
    const connected = await testConnection();
    
    if (connected) {
        console.log('🎉 ¡Conexión exitosa! Puedes continuar.');
    } else {
        console.log('❌ No se pudo conectar. Revisa tu DATABASE_URL en .env');
    }
    
    process.exit(connected ? 0 : 1);
}

test();