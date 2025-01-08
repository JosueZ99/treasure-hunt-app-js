const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // "Bearer <token>"
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request for protected routes
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
