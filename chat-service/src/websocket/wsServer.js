'use strict';

/**
 * chat-service/src/websocket/wsServer.js
 * WebSocket server dùng native 'ws' library (production-ready)
 *
 * URL kết nối: ws://localhost:8085/ws/chat?tripId=<uuid>&token=<jwt>
 * Test:        wscat -c "ws://localhost:8085/ws/chat?tripId=xxx&token=yyy"
 */

const WebSocket = require('ws');
const jwt       = require('jsonwebtoken');
const url       = require('url');
const { Message } = require('../models/Message');
const roomManager = require('./roomManager');
const axios       = require('axios'); // For calling internal trip-service

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_CONTENT_LENGTH = 1000;
const MAX_CONNECTIONS_PER_ROOM = 50;
const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'http://localhost:8081';

/**
 * Khởi tạo WebSocket server gắn vào http.Server
 * @param {import('http').Server} httpServer
 */
function initWsServer(httpServer) {
  const wss = new WebSocket.Server({
    server: httpServer,
    path:   '/ws/chat',
  });

  wss.on('connection', async (ws, req) => {
    // ── 1. Parse query params ────────────────────────────────
    const params = new URL(req.url, 'http://localhost').searchParams;
    const token  = params.get('token');
    const tripId = params.get('tripId');

    // ── 2. Validate token + tripId ───────────────────────────
    if (!token || !tripId) {
      ws.close(4001, 'token and tripId are required');
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      ws.close(4001, 'Invalid or expired token');
      return;
    }

    const userId     = decoded.userId;
    const senderName = decoded.email || userId;

    // Call Trip Service to verify if trip exists and is public, or user is member
    try {
      const response = await axios.get(`${TRIP_SERVICE_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trip = response.data;
      // Depending on rules, you might want to check trip.visibility or user membership.
      // Basic check: if API returns 200, trip exists.
    } catch (err) {
      console.error(`[WS] Trip verification failed for ${tripId}:`, err.message);
      ws.close(4003, 'Trip not found or unauthorized');
      return;
    }

    // Limit connections per room
    if (roomManager.getClientCount(tripId) >= MAX_CONNECTIONS_PER_ROOM) {
      ws.close(4004, 'Room is full');
      return;
    }

    // ── 3. Đăng ký client vào room ───────────────────────────
    const clientInfo = { ws, userId, senderName };
    roomManager.addClient(tripId, clientInfo);

    console.log(`[WS] User ${userId} joined trip ${tripId}`);

    // ── 4. Broadcast system message: user joined ─────────────
    roomManager.broadcast(tripId, {
      type:    'system',
      content: `${senderName} đã tham gia chat`,
      tripId,
      timestamp: new Date().toISOString(),
    });

    // ── 5. Message handler ───────────────────────────────────
    ws.on('message', async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
        return;
      }

      let content = (data.content || '').trim();

      // Strip HTML tags
      content = content.replace(/<[^>]*>/g, '').trim();

      // Validate content
      if (!content) {
        ws.send(JSON.stringify({ error: 'Message content cannot be empty' }));
        return;
      }
      if (content.length > MAX_CONTENT_LENGTH) {
        ws.send(JSON.stringify({ error: `Message too long (max ${MAX_CONTENT_LENGTH} chars)` }));
        return;
      }

      // Lưu vào DB
      let message;
      try {
        message = await Message.create({
          tripId,
          senderId:   userId,
          senderEmail: senderName, // Map senderName to senderEmail to match DB model
          content,
          type: 'text',
        });
      } catch (err) {
        console.error('[WS] DB error:', err.message);
        ws.send(JSON.stringify({ error: 'Failed to save message' }));
        return;   // Không broadcast nếu lưu DB thất bại
      }

      console.log(`[WS] Message in trip ${tripId} from ${userId}`);

      // Broadcast đến TẤT CẢ client trong room (kể cả sender)
      roomManager.broadcast(tripId, {
        id:        message.id,
        tripId,
        senderId:  userId,
        senderName,
        content,
        type:      'text',
        createdAt: message.createdAt,
      });
    });

    // ── 6. Disconnect handler ────────────────────────────────
    ws.on('close', () => {
      roomManager.removeClient(tripId, ws);
      console.log(`[WS] User ${userId} left trip ${tripId}`);

      // Broadcast system message: user left
      roomManager.broadcast(tripId, {
        type:    'system',
        content: `${senderName} đã rời chat`,
        tripId,
        timestamp: new Date().toISOString(),
      });
    });

    // ── 7. Error handler ─────────────────────────────────────
    ws.on('error', (err) => {
      console.error(`[WS] Error for user ${userId} in trip ${tripId}:`, err.message);
    });
  });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    console.log('[WS] Closing all connections for graceful shutdown');
    const rooms = roomManager.getRoomsList(); // We'll add this method
    rooms.forEach(roomInfo => {
      const clients = roomManager.getClients(roomInfo.tripId);
      if (clients) {
        clients.forEach((client) => {
          if (client.ws) client.ws.close(1001, 'Server shutting down');
        });
      }
    });
    roomManager.clearRooms();
    wss.close();
  });

  console.log('[chat-service] Native WebSocket server initialized at /ws/chat');
  return wss;
}

module.exports = { initWsServer };
