# Join Request Service (TV2)

**Port:** `8083`  
**Stack:** Node.js + Express.js + Sequelize  
**Database:** PostgreSQL  
**Phụ trách:** TV2

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/join-requests` | Gửi yêu cầu tham gia trip | JWT |
| GET | `/join-requests?tripId=` | Danh sách request theo trip | JWT |
| PUT | `/join-requests/:id/approve` | Duyệt request | JWT (chỉ trip owner) |
| PUT | `/join-requests/:id/reject` | Từ chối request | JWT (chỉ trip owner) |

## RabbitMQ Events (Producer)

Sau khi approve/reject, publish event vào queue `join-request-events`:

```json
{
  "event": "join.approved",
  "tripId": "uuid",
  "userId": "uuid",
  "timestamp": "2026-05-08T10:00:00Z"
}
```

## Khởi chạy local

```bash
cd join-request-service
npm install
cp ../.env.example .env   # điền JOIN_DB_*, RABBITMQ_*
npm run dev
```
