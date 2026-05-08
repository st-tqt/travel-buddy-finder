'use strict';

require('dotenv').config();

const express            = require('express');
const { sequelize }      = require('./config/database');
const Notification       = require('./models/Notification');
const notificationRoutes = require('./routes/notifications');
const { startConsumer }  = require('./consumers/joinRequestConsumer');

const app  = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 8084;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/notifications', notificationRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'notification-service', port: PORT })
);

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[notification-service] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Bootstrap ───────────────────────────────────────────────
async function bootstrap() {
  try {
    // 1. Kết nối và sync DB (tạo bảng nếu chưa có)
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connected.');

    await sequelize.sync({ alter: true });
    console.log('[DB] Tables synced.');

    // 2. Start RabbitMQ consumer
    await startConsumer();

    // 3. Start HTTP server
    app.listen(PORT, () => {
      console.log(`[notification-service] Running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('[notification-service] Bootstrap failed:', err.message);
    process.exit(1);
  }
}

bootstrap();

module.exports = app;
