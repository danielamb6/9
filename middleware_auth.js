const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Acceso denegado. Token no proporcionado.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar rol de administrador
const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requieren privilegios de administrador.' 
        });
    }
    next();
};

module.exports = {
    verifyToken,
    verifyAdmin
};