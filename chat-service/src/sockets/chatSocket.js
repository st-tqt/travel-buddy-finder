'use strict';

/**
 * chatSocket.js – TV3
 *
 * WebSocket handler với Socket.IO
 * - Room isolation theo tripId: mỗi trip có 1 room riêng
 * - Authenticate qua JWT trong query param hoặc header
 * - Lưu lịch sử tin nhắn vào DB
 *
 * Frontend kết nối:
 *   const socket = io('http://localhost:8085', {
 *     path: '/ws/chat',
 *     query: { tripId: 'uuid', token: 'jwt_token' }
 *   });
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function initSocket(io) {
  // ── Middleware: Authenticate WebSocket connection ──────────
  io.use((socket, next) => {
    const token  = socket.handshake.query.token
                || socket.handshake.auth.token;
    const tripId = socket.handshake.query.tripId;

    if (!token) {
      return next(new Error('Authentication error: token required'));
    }
    if (!tripId) {
      return next(new Error('Authentication error: tripId required'));
    }

    try {
      const decoded  = jwt.verify(token, JWT_SECRET);
      socket.user    = { userId: decoded.userId, email: decoded.email };
      socket.tripId  = tripId;
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  // ── Connection handler ─────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, email } = socket.user;
    const { tripId }        = socket;
    const roomName          = `trip:${tripId}`;

    // Join room của trip
    socket.join(roomName);
    console.log(`[chat-service] User ${email} joined room ${roomName}`);

    // Thông báo cho room khi user join
    socket.to(roomName).emit('user_joined', {
      type:      'user_joined',
      userId,
      userEmail: email,
      timestamp: new Date().toISOString(),
    });

    // ── Nhận và broadcast tin nhắn ─────────────────────────
    socket.on('message', async (data) => {
      const messagePayload = {
        type:      'message',
        senderId:  userId,
        senderEmail: email,
        content:   data.content,
        tripId,
        timestamp: new Date().toISOString(),
      };

      // TODO TV3: Lưu vào DB
      // const { Message } = require('../models/Message');
      // await Message.create({ tripId, senderId: userId, content: data.content });

      // Broadcast cho toàn bộ room (kể cả người gửi)
      io.to(roomName).emit('message', messagePayload);
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[chat-service] User ${email} left room ${roomName}`);
      socket.to(roomName).emit('user_left', {
        type:      'user_left',
        userId,
        userEmail: email,
        timestamp: new Date().toISOString(),
      });
    });
  });
}

module.exports = { initSocket };
