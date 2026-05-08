# Notification Service ⭐ (TV3)

**Port:** `8084`  
**Stack:** Node.js + Express.js + Sequelize + PostgreSQL + RabbitMQ  
**Phụ trách:** TV3 – Backend Lead

---

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | `/notifications/:userId` | Lấy danh sách thông báo (mới nhất trước) | JWT |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc | JWT |
| GET | `/health` | Health check | Public |

### Response schemas

**GET /notifications/:userId**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "tripId": "uuid",
      "message": "Yêu cầu tham gia trip \"Đà Lạt\" đã được duyệt",
      "type": "JOIN_APPROVED",
      "isRead": false,
      "createdAt": "2026-05-08T10:00:00.000Z",
      "updatedAt": "2026-05-08T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

**PUT /notifications/:id/read**
```json
{ "message": "Marked as read" }
```

---

## 📨 Hướng dẫn TV2 – Publish Event vào RabbitMQ

> Sau khi approve hoặc reject join request, TV2 **BẮT BUỘC** publish event
> vào RabbitMQ theo đúng schema dưới đây. Notification Service sẽ tự động
> nhận và lưu vào DB.

### Thông tin Exchange

| Thông số | Giá trị |
|----------|---------|
| Exchange | `join-request-events` |
| Type | `direct` |
| Durable | `true` |
| Routing key (approve) | `join.approved` |
| Routing key (reject) | `join.rejected` |

### Event Payload (bắt buộc đúng format)

```json
{
  "event"   : "join.approved",
  "userId"  : "uuid-của-người-gửi-request",
  "tripId"  : "uuid-của-trip",
  "tripName": "Tên chuyến đi"
}
```

### Code mẫu cho TV2 (amqplib)

```js
// join-request-service/src/publishers/joinEventPublisher.js
const amqplib = require('amqplib');

const RABBITMQ_URL  = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'join-request-events';

async function publishJoinEvent({ event, userId, tripId, tripName }) {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel    = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

  const routingKey = event; // 'join.approved' hoặc 'join.rejected'
  const payload    = JSON.stringify({ event, userId, tripId, tripName });

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(payload), {
    persistent: true,
  });

  console.log(`[RabbitMQ] Published ${routingKey}:`, payload);

  await channel.close();
  await connection.close();
}

module.exports = { publishJoinEvent };
```

```js
// Gọi trong route approve:
await publishJoinEvent({
  event   : 'join.approved',
  userId  : joinRequest.userId,
  tripId  : joinRequest.tripId,
  tripName: trip.title,
});
```

---

## Cấu trúc thư mục

```
notification-service/
├── src/
│   ├── config/
│   │   └── database.js          ← Sequelize connection
│   ├── consumers/
│   │   └── joinRequestConsumer.js  ← Subscribe RabbitMQ queue
│   ├── middleware/
│   │   └── authMiddleware.js    ← Copy từ shared/middleware/
│   ├── models/
│   │   └── Notification.js      ← Sequelize model
│   ├── routes/
│   │   └── notifications.js     ← GET /:userId, PUT /:id/read
│   └── app.js                   ← Entry point
├── package.json
├── Dockerfile
└── README.md
```

## Khởi chạy local

```bash
# 1. Chạy PostgreSQL và RabbitMQ trước
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# 2. Cài dependencies
cd notification-service
npm install

# 3. Tạo .env (copy từ root .env.example)
cp ../.env.example .env
# Điền: NOTIFICATION_DB_*, JWT_SECRET, RABBITMQ_URL

# 4. Chạy
npm run dev
```

## Test RabbitMQ thủ công (demo cho giám khảo)

```bash
# Publish event thủ công để test consumer
node -e "
const amqplib = require('amqplib');
(async () => {
  const conn = await amqplib.connect('amqp://localhost:5672');
  const ch   = await conn.createChannel();
  await ch.assertExchange('join-request-events', 'direct', { durable: true });
  ch.publish(
    'join-request-events',
    'join.approved',
    Buffer.from(JSON.stringify({
      event: 'join.approved',
      userId: 'user-uuid-123',
      tripId: 'trip-uuid-456',
      tripName: 'Chuyến đi Đà Lạt'
    })),
    { persistent: true }
  );
  console.log('Published!');
  await ch.close();
  await conn.close();
})();
"
```

Log kỳ vọng trong notification-service:
```
[RabbitMQ] Received: { event: 'join.approved', userId: '...', tripId: '...', tripName: '...' }
[RabbitMQ] ✅ Saved JOIN_APPROVED notification for user user-uuid-123
```

## RabbitMQ Management UI

> Truy cập http://localhost:15672 (guest/guest) để xem queue, exchange, message rate
