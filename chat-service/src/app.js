'use strict';

require('dotenv').config();
const http      = require('http');
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const { sequelize } = require('./models/Message');
const messageRoutes  = require('./routes/messages');
const { initWsServer } = require('./websocket/wsServer');
const errorHandler   = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);     // Socket.IO cần raw http.Server
const PORT   = process.env.CHAT_SERVICE_PORT || 8085;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// ── REST Routes ─────────────────────────────────────────────
app.use('/messages', messageRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'chat-service' }));

app.use(errorHandler);

// ── WebSocket (Native WS) ───────────────────────────────────
initWsServer(server);

// ── Start ───────────────────────────────────────────────────
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('[chat-service] Database connected and synced successfully.');
    server.listen(PORT, () => {
      console.log(`[chat-service] Running on port ${PORT}`);
      console.log(`[chat-service] WebSocket endpoint: ws://localhost:${PORT}/ws/chat`);
    });
  } catch (error) {
    console.error('[chat-service] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server };

