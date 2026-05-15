'use strict';

/**
 * shared/middleware/authMiddleware.js
 * ─────────────────────────────────────────────────────────────
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const isTrustGateway = process.env.TRUST_GATEWAY === 'true';

  if (isTrustGateway) {
    const userId = req.headers['x-user-id'];
    const email = req.headers['x-user-email'];

    if (userId && email) {
      req.user = { userId, email };
      return next();
    } else {
      return res.status(401).json({ error: 'Unauthorized: Missing gateway headers' });
    }
  }

  // DIRECT mode: verify JWT
  if (!process.env.JWT_SECRET) {
    console.error('[authMiddleware] FATAL: JWT_SECRET is not set.');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
