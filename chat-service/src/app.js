'use strict';

require('dotenv').config();
const http      = require('http');
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const { Server } = require('socket.io');

const messageRoutes  = require('./routes/messages');
const { initSocket } = require('./sockets/chatSocket');

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

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Socket.IO (WebSocket) ───────────────────────────────────
const io = new Server(server, {
  path: '/ws/chat',        // ws://host:8085/ws/chat?tripId=...
  cors: { origin: '*' },
});

initSocket(io);

// ── Start ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[chat-service] Running on port ${PORT}`);
  console.log(`[chat-service] WebSocket endpoint: ws://localhost:${PORT}/ws/chat`);
});

module.exports = { app, server };
