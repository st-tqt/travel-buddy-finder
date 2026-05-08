# Chat Service ⭐ (TV3)

**Port:** `8085`  
**Stack:** Node.js + Express.js + Socket.IO + Sequelize (PostgreSQL)  
**Phụ trách:** TV3 – Backend Lead

## Trách nhiệm

- WebSocket realtime chat theo từng `tripId`
- Lưu lịch sử tin nhắn vào PostgreSQL
- REST API để lấy lịch sử tin nhắn

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | `/messages?tripId=` | Lịch sử tin nhắn của trip | JWT |
| WS | `ws://host:8085/ws/chat?tripId=` | WebSocket kết nối chat | JWT (query param token) |

## Cấu trúc thư mục (dự kiến)

```
chat-service/
├── src/
│   ├── config/
│   │   └── db.js         # Sequelize connection
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── messages.js
│   ├── controllers/
│   │   └── messageController.js
│   ├── sockets/
│   │   └── chatSocket.js  # Socket.IO handlers, room isolation theo tripId
│   └── index.js
├── Dockerfile
├── package.json
└── README.md
```

## Khởi chạy local

```bash
cd chat-service
npm install
cp ../.env.example .env   # điền CHAT_DB_*
npm run dev
```

## WebSocket Protocol

```
// Kết nối
ws://localhost:8085/ws/chat?tripId=<uuid>&token=<jwt>

// Client gửi message
{ "type": "message", "content": "Xin chào!", "tripId": "uuid" }

// Server broadcast cho room
{ "type": "message", "senderId": "uuid", "senderName": "Nguyen Van A",
  "content": "Xin chào!", "timestamp": "2026-05-08T10:00:00Z" }

// Notification khi user join room
{ "type": "user_joined", "userId": "uuid", "userName": "Nguyen Van A" }
```

## Lưu ý quan trọng

> ⚠️ **WebSocket qua API Gateway:** Kong/Spring Cloud Gateway cần cấu hình để
> forward WebSocket upgrade header. **Phương án dự phòng:** Frontend kết nối
> WebSocket trực tiếp vào Chat Service (bypass Gateway) – chấp nhận được trong
> scope đồ án.
