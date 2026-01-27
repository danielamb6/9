const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// OBTENER ADMINS
router.get('/admin', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admin');
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error SQL al obtener:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// CREAR ADMIN (Aquí es donde está el problema probablemente)
router.post('/admin', async (req, res) => {
    // 1. Imprimimos qué datos llegan para verificar
    console.log("📩 Datos recibidos:", req.body);

    const { nombre, email, rol, username, password } = req.body;

    try {
        // Consulta SQL ajustada a tu código actual
        const query = `
            INSERT INTO admin (nombre, email, rol, username, password, activo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [nombre, email, rol, username, password, true];
        
        const result = await pool.query(query, values);
        console.log("✅ Usuario insertado:", result.rows[0]);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        // ESTO ES LO IMPORTANTE: Imprimirá el error exacto en tu terminal
        console.error('❌ ERROR SQL AL INSERTAR:', error.message);
        
        // Devolvemos el error detallado al frontend para que lo veas en consola F12
        res.status(500).json({ 
            error: 'Error de base de datos', 
            detalle: error.message 
        });
    }
});

// EDITAR ADMIN
router.put('/admin/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, username, activo } = req.body;

    try {
        const query = `
            UPDATE admin 
            SET nombre = $1, email = $2, rol = $3, username = $4, activo = $5
            WHERE id = $6
            RETURNING *
        `;
        const values = [nombre, email, rol, username, activo, id];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error SQL al actualizar:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;