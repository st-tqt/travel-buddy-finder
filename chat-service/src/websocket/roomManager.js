'use strict';

/**
 * chat-service/src/websocket/roomManager.js
 * Quản lý WebSocket rooms theo tripId
 *
 * rooms = Map<tripId, Set<{ ws, userId, senderName }>>
 */

const rooms = new Map();

/**
 * Thêm client vào room
 * @param {string} tripId
 * @param {{ ws: WebSocket, userId: string, senderName: string }} clientInfo
 */
function addClient(tripId, clientInfo) {
  if (!rooms.has(tripId)) {
    rooms.set(tripId, new Set());
  }
  rooms.get(tripId).add(clientInfo);
  console.log(`[RoomManager] Added ${clientInfo.userId} to room ${tripId}. Total: ${getClientCount(tripId)}`);
}

/**
 * Xóa client khỏi room theo đối tượng ws
 * @param {string} tripId
 * @param {WebSocket} ws
 * @returns {{ userId: string, senderName: string } | null} client vừa bị xóa
 */
function removeClient(tripId, ws) {
  const room = rooms.get(tripId);
  if (!room) return null;

  let removed = null;
  for (const client of room) {
    if (client.ws === ws) {
      removed = client;
      room.delete(client);
      break;
    }
  }

  // Dọn dẹp room rỗng
  if (room.size === 0) {
    rooms.delete(tripId);
  }

  if (removed) {
    console.log(`[RoomManager] Removed ${removed.userId} from room ${tripId}. Total: ${getClientCount(tripId)}`);
  }
  return removed;
}

/**
 * Broadcast message đến tất cả client trong room
 * @param {string} tripId
 * @param {object} message  – sẽ được JSON.stringify
 * @param {WebSocket} [excludeWs] – không gửi đến ws này (optional)
 */
function broadcast(tripId, message, excludeWs = null) {
  const room = rooms.get(tripId);
  if (!room) return;

  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client.ws === excludeWs) continue;
    if (client.ws.readyState === 1 /* OPEN */) {
      client.ws.send(payload);
    }
  }
}

/**
 * Đếm số client đang trong room
 * @param {string} tripId
 * @returns {number}
 */
function getClientCount(tripId) {
  return rooms.has(tripId) ? rooms.get(tripId).size : 0;
}

/**
 * Liệt kê tất cả rooms (debug)
 * @returns {{ tripId: string, count: number }[]}
 */
function getRoomsList() {
  const result = [];
  for (const [tripId, room] of rooms.entries()) {
    result.push({ tripId, count: room.size });
  }
  return result;
}

function getClients(tripId) {
  return rooms.get(tripId) || new Set();
}

function clearRooms() {
  rooms.clear();
}

module.exports = { addClient, removeClient, broadcast, getClientCount, getRooms: getRoomsList, getRoomsList, getClients, clearRooms };
