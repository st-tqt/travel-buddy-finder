'use strict';

/**
 * notification-service/src/middleware/authMiddleware.js
 * Copy từ shared/middleware/authMiddleware.js – TV3 maintain
 *
 * Responses:
 *   Thiếu / sai format → 401 { error: "No token provided" }
 *   Hết hạn            → 401 { error: "Token expired" }
 *   Không hợp lệ       → 401 { error: "Invalid token" }
 */

const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('[authMiddleware] FATAL: JWT_SECRET is not set. Exiting.');
  process.exit(1);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    req.user = {
      userId: decoded.userId,
      email:  decoded.email,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
