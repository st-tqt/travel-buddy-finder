'use strict';
require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const compression    = require('compression');
const { v4: uuidv4 } = require('uuid');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt            = require('jsonwebtoken');
const rateLimit      = require('express-rate-limit');
const swaggerUi      = require('swagger-ui-express');
const YAML           = require('js-yaml');
const fs             = require('fs');
const path           = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET         = process.env.JWT_SECRET || 'default_secret';
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10);

// ── Helpers ────────────────────────────────────────────────
function log(level, reqId, method, url, status, msg) {
    const ts = new Date().toISOString();
    console[level](`[GATEWAY] reqId=${reqId} ${ts} ${method} ${url} ${status} - ${msg}`);
}

// ── Security headers (helmet) ─────────────────────────────
app.use(helmet());

// ── Compression ───────────────────────────────────────────
app.use(compression());

// ── CORS ───────────────────────────────────────────────────
app.use(cors());

// ── Request size limit (prevent oversized body attacks) ────
app.use(express.json({ limit: '10kb' }));

// ── Assign unique Request ID to every request ─────────────
app.use((req, _res, next) => {
    req.reqId = req.headers['x-request-id'] || uuidv4();
    next();
});

// ── Morgan-style request logger ───────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        const level = res.statusCode >= 500 ? 'error'
                    : res.statusCode >= 400 ? 'warn'
                    : 'log';
        log(level, req.reqId, req.method, req.originalUrl, res.statusCode, `${ms}ms`);
    });
    next();
});

// ── Rate limiters ─────────────────────────────────────────
// General: 100 req / 15 min / IP
const generalLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max      : 100,
    standardHeaders: true,
    legacyHeaders  : false,
    message  : { error: 'Too many requests, please try again later.' }
});

// Auth routes: 10 req / 15 min / IP (strict)
const authLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max      : 10,
    standardHeaders: true,
    legacyHeaders  : false,
    message  : { error: 'Too many authentication attempts, please try again later.' }
});

app.use(generalLimiter);

// ── Swagger UI ─────────────────────────────────────────────
try {
    const candidates = [
        path.join(__dirname, 'docs', 'api-contract.yaml'),
        path.join(__dirname, '..', 'docs', 'api-contract.yaml'),
        '/docs/api-contract.yaml'
    ];
    const resolvedPath = candidates.find(p => fs.existsSync(p));

    if (resolvedPath) {
        const swaggerDoc = YAML.load(fs.readFileSync(resolvedPath, 'utf8'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
            customSiteTitle: 'Travel Buddy Finder API',
            swaggerOptions  : { persistAuthorization: true }
        }));
        console.log('[GATEWAY] Swagger UI available at /api-docs');
    } else {
        console.warn('[GATEWAY] api-contract.yaml not found, Swagger UI disabled');
    }
} catch (err) {
    console.warn('[GATEWAY] Failed to load Swagger YAML:', err.message);
}

// ── Gateway health ─────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'api-gateway', timestamp: new Date() });
});

// ── JWT Middleware ─────────────────────────────────────────
function verifyJwt(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        // Forward identity headers to downstream services
        req.headers['x-user-id']      = String(decoded.userId || '');
        req.headers['x-user-email']   = String(decoded.email  || '');
        // Forward request ID for distributed tracing
        req.headers['x-request-id']   = req.reqId;
        next();
    } catch (err) {
        log('warn', req.reqId, req.method, req.url, 401, err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ── Proxy factory ──────────────────────────────────────────
function makeProxy(target, { pathRewritePrefix = '/api' } = {}) {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout : REQUEST_TIMEOUT_MS,
        timeout      : REQUEST_TIMEOUT_MS,
        pathRewrite  : { [`^${pathRewritePrefix}`]: '' },
        on: {
            proxyReq: (proxyReq, req) => {
                // Đảm bảo request-id luôn được forward xuống service
                proxyReq.setHeader('x-request-id', req.reqId || uuidv4());
            },
            error: (err, req, res) => {
                const isTimeout = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT'
                                  || err.code === 'ECONNREFUSED'
                                  || err.message.includes('timeout');
                const status    = isTimeout ? 503 : 502;
                const message   = isTimeout
                    ? 'Service temporarily unavailable'
                    : 'Bad gateway';

                log('error', req.reqId, req.method, req.url, status, err.message);

                if (!res.headersSent) {
                    res.status(status).json({ error: message });
                }
            },
            proxyRes: (proxyRes, req) => {
                const status = proxyRes.statusCode;
                if (status >= 500) {
                    log('error', req.reqId, req.method, req.url, status, `Downstream 5xx from ${target}`);
                } else if (status >= 400) {
                    log('warn', req.reqId, req.method, req.url, status, `Downstream 4xx from ${target}`);
                }
            }
        }
    });
}

// ── Routes – User Service ──────────────────────────────────
const USER_URL = process.env.USER_SERVICE_URL || 'http://user-service:8081';
app.use('/api/auth',  authLimiter, makeProxy(USER_URL));   // public: register/login (strict rate limit)
app.use('/api/users', verifyJwt,   makeProxy(USER_URL));

// ── Routes – Trip Service ──────────────────────────────────
const TRIP_URL = process.env.TRIP_SERVICE_URL || 'http://trip-service:8082';
app.get ('/api/trips',     makeProxy(TRIP_URL));               // public: list trips
app.get ('/api/trips/:id', makeProxy(TRIP_URL));               // public: get trip
app.use ('/api/trips',     verifyJwt, makeProxy(TRIP_URL));    // protected: create/update/delete

// ── Routes – Join Request Service ─────────────────────────
const JOIN_URL = process.env.JOIN_SERVICE_URL || 'http://join-request-service:8083';
app.use('/api/join-requests', verifyJwt, makeProxy(JOIN_URL));

// ── Routes – Notification Service ─────────────────────────
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8084';
app.use('/api/notifications', verifyJwt, makeProxy(NOTIF_URL));

// ── Routes – Chat Service ──────────────────────────────────
const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://chat-service:8085';
app.use('/api/messages', verifyJwt, makeProxy(CHAT_URL));

// ── Routes – Review Service ────────────────────────────────
const REVIEW_URL = process.env.REVIEW_SERVICE_URL || 'http://review-service:8086';
app.get ('/api/reviews/health',   makeProxy(REVIEW_URL));      // public: health check
app.get ('/api/reviews/user/:id', makeProxy(REVIEW_URL));      // public: get reviews
app.post('/api/reviews',          verifyJwt, makeProxy(REVIEW_URL)); // protected: create review

// ── Centralized Error Handler ──────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    const status    = err.status || 500;
    const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET';

    log('error', req.reqId, req.method, req.url, status, err.message);

    if (isTimeout) {
        return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    if (status >= 500) {
        return res.status(502).json({ error: 'Bad gateway' });
    }
    return res.status(status).json({ error: err.message || 'Internal server error' });
});

// ── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[GATEWAY] Running on port ${PORT}`);
    console.log(`[GATEWAY] Swagger UI → http://localhost:${PORT}/api-docs`);
    console.log(`[GATEWAY] Timeout   → ${REQUEST_TIMEOUT_MS}ms`);
});
