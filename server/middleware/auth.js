const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'qlingo-super-secret-key-2026';

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id;
      return next();
    } catch (err) {
      // Invalid token, fallback to default
    }
  }
  req.userId = 1; // Default guest/demo user
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido' });
  }
}

module.exports = {
  JWT_SECRET,
  optionalAuth,
  requireAuth
};
