'use strict';

/**
 * shared/middleware/authMiddleware.test.js
 *
 * Unit tests cho authMiddleware
 * Chạy từ thư mục gốc: npx jest shared/middleware/authMiddleware.test.js
 *
 * Cài trước: npm install --save-dev jest jsonwebtoken
 */

const jwt = require('jsonwebtoken');

const TEST_SECRET = 'test_secret_key_for_unit_tests';

// Set env trước khi require middleware
process.env.JWT_SECRET = TEST_SECRET;
const authMiddleware = require('./authMiddleware');

// ── Helpers ──────────────────────────────────────────────────
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function makeValidToken(payload = {}, opts = {}) {
  return jwt.sign(
    { userId: 'uuid-1234', email: 'test@test.com', ...payload },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '1h', ...opts }
  );
}

// ── Tests ────────────────────────────────────────────────────
describe('authMiddleware', () => {

  test('✅ Token hợp lệ → gọi next() và gắn req.user', () => {
    const token = makeValidToken();
    const req   = { headers: { authorization: `Bearer ${token}` } };
    const res   = makeRes();
    const next  = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 'uuid-1234', email: 'test@test.com' });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('❌ Không có Authorization header → 401 "No token provided"', () => {
    const req  = { headers: {} };
    const res  = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  test('❌ Header không có prefix "Bearer " → 401 "No token provided"', () => {
    const req  = { headers: { authorization: 'Token abc123' } };
    const res  = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  test('❌ Token hết hạn → 401 "Token expired"', () => {
    // expiresIn: 0 → expired ngay lập tức
    const token = makeValidToken({}, { expiresIn: -1 });
    const req   = { headers: { authorization: `Bearer ${token}` } };
    const res   = makeRes();
    const next  = jest.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
  });

  test('❌ Token sai (chữ ký không hợp lệ) → 401 "Invalid token"', () => {
    const token = jwt.sign({ userId: 'x', email: 'x@x.com' }, 'wrong_secret');
    const req   = { headers: { authorization: `Bearer ${token}` } };
    const res   = makeRes();
    const next  = jest.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('❌ Token là chuỗi rác → 401 "Invalid token"', () => {
    const req  = { headers: { authorization: 'Bearer this.is.garbage' } };
    const res  = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('❌ "Bearer " không có token phía sau → 401 "No token provided"', () => {
    const req  = { headers: { authorization: 'Bearer ' } };
    const res  = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

});
