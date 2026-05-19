# TV5 Integration Guide – Travel Buddy Finder Week 3

## Đoạn Docker Compose cần thêm/cập nhật

### A. review-service (thêm vào docker-compose.yml)

```yaml
review-service:
  build: ./review-service
  ports:
    - "${REVIEW_SERVICE_PORT:-8086}:8086"
  environment:
    REVIEW_DB_URL: jdbc:postgresql://review-db:5432/review_db
    REVIEW_DB_USERNAME: ${REVIEW_DB_USER:-postgres}
    REVIEW_DB_PASSWORD: ${REVIEW_DB_PASSWORD:-password}
    JWT_SECRET: ${JWT_SECRET}
  depends_on:
    review-db:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:8086/health || exit 1"]
    interval: 15s
    timeout: 10s
    retries: 5
    start_period: 30s
  networks:
    - travel-buddy-network
  restart: on-failure
```

### B. api-gateway (thêm vào docker-compose.yml)

```yaml
api-gateway:
  build: ./api-gateway
  ports:
    - "${API_GATEWAY_PORT:-3000}:3000"
  environment:
    PORT: 3000
    JWT_SECRET: ${JWT_SECRET}
    USER_SERVICE_URL: http://user-service:8081
    TRIP_SERVICE_URL: http://trip-service:8082
    JOIN_SERVICE_URL: http://join-request-service:8083
    NOTIFICATION_SERVICE_URL: http://notification-service:8084
    CHAT_SERVICE_URL: http://chat-service:8085
    REVIEW_SERVICE_URL: http://review-service:8086
    REQUEST_TIMEOUT_MS: 10000
  volumes:
    - ./docs:/docs:ro
  depends_on:
    user-service:
      condition: service_started
    review-service:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
    interval: 15s
    timeout: 10s
    retries: 5
  networks:
    - travel-buddy-network
  restart: unless-stopped
```

### C. Biến môi trường thêm vào .env gốc

```env
REVIEW_DB_USER=postgres
REVIEW_DB_PASSWORD=password
REVIEW_SERVICE_PORT=8086
API_GATEWAY_PORT=3000
JWT_SECRET=your_shared_secret_minimum_32_chars
```

---

## Thứ tự khởi động (boot order)

```
Tầng 1: user-db, trip-db, join-db, notification-db, chat-db, review-db, rabbitmq
         (song song, chờ healthcheck)

Tầng 2: user-service, trip-service, join-request-service,
         notification-service, chat-service, review-service
         (sau khi DB tương ứng healthy)

Tầng 3: api-gateway
         (sau khi user-service started + review-service healthy)

Tầng 4: frontend
         (sau khi api-gateway healthy)
```

---

## Lỗi thường gặp & Fix

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| review-service không kết nối DB | dùng `localhost` thay vì `review-db` | Đảm bảo `REVIEW_DB_URL=jdbc:postgresql://review-db:5432/review_db` |
| Gateway 502 → review-service | `REVIEW_SERVICE_URL` chưa set | Kiểm tra env trong docker-compose |
| POST /reviews → 401 dù có token | JWT_SECRET không khớp | Đảm bảo cùng `JWT_SECRET` từ .env |
| review-service không start | Thiếu biến `JWT_SECRET` | Thêm vào .env và docker-compose environment |

---

## Endpoint summary – Review Service (:8086)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Healthcheck |
| POST | /reviews | JWT required | Tạo review |
| GET | /reviews/user/:id | Public | Lấy reviews + averageRating |

Qua Gateway:
- `GET  http://localhost:3000/api/reviews/health`
- `POST http://localhost:3000/api/reviews` (Bearer token)
- `GET  http://localhost:3000/api/reviews/user/:id`

---

## Swagger UI

Sau khi api-gateway chạy:
```
http://localhost:3000/api-docs
```
