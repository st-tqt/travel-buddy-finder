'use strict';

/**
 * shared/middleware/authMiddleware.js
 * ─────────────────────────────────────────────────────────────
 * JWT Authentication Middleware
 * Dùng chung cho TV2 (trip-service, join-request-service)
 *                 TV3 (notification-service, chat-service)
 *
 * ── Cách dùng ───────────────────────────────────────────────
 *
 *   // Monorepo: import từ shared/
 *   const authMiddleware = require('../../../shared/middleware/authMiddleware');
 *
 *   // Hoặc copy thẳng vào src/middleware/ của từng service:
 *   const authMiddleware = require('../middleware/authMiddleware');
 *
 *   router.get('/protected', authMiddleware, (req, res) => {
 *     console.log(req.user.userId);   // UUID string
 *     console.log(req.user.email);    // email string
 *   });
 *
 * ── JWT Payload chuẩn toàn nhóm (TV3 leader định nghĩa) ─────
 *
 *   {
 *     "userId": "550e8400-e29b-41d4-a716-446655440000",
 *     "email":  "user@example.com",
 *     "iat":    1715000000,
 *     "exp":    1715604800
 *   }
 *
 * ── Responses ───────────────────────────────────────────────
 *
 *   Thiếu / sai format token → 401 { error: "No token provided" }
 *   Token hết hạn            → 401 { error: "Token expired" }
 *   Token không hợp lệ       → 401 { error: "Invalid token" }
 *
 * ── Yêu cầu môi trường ──────────────────────────────────────
 *
 *   JWT_SECRET phải được set trong .env (xem .env.example)
 *   Thuật toán: HS256 (mặc định của jsonwebtoken)
 */

const jwt = require('jsonwebtoken');

// Fail-fast: nếu thiếu JWT_SECRET thì không cho service khởi động
if (!process.env.JWT_SECRET) {
  console.error('[authMiddleware] FATAL: JWT_SECRET is not set. Exiting.');
  process.exit(1);
}

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  // ── 1. Kiểm tra header tồn tại và đúng format "Bearer <token>" ──
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7); // bỏ "Bearer " (7 ký tự)

  // ── 2. Guard: token rỗng sau khi trim ────────────────────────────
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // ── 3. Verify token ──────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // ── 4. Gắn payload vào req.user ──────────────────────────────
    req.user = {
      userId: decoded.userId,
      email:  decoded.email,
    };

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    // JsonWebTokenError, NotBeforeError, hoặc bất kỳ lỗi nào khác
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
