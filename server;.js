const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Importar rutas
const adminRoutes = require('./routes/adminRoutes');

// Usar rutas
app.use('/api', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Sistema de Incidencias funcionando',
        status: 'online',
        endpoints: {
            admin: '/api/admin',
            admin_by_id: '/api/admin/:id'
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📊 Base de datos: Conectado a Neon.tech`);
});