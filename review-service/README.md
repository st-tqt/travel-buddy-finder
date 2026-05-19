# Review Service (TV1 – Sprint 3)

**Port:** `8086`  
**Stack:** Java 21 + Spring Boot 3.2.5 + Spring Security + PostgreSQL  
**Database:** `review_db`  
**Phụ trách:** TV1

---

## API Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | `/reviews` | Bearer JWT | Viết review sau chuyến đi |
| GET | `/reviews/user/:id` | Public | Lấy reviews + averageRating của user |
| GET | `/health` | Public | Health check |

### Request – POST /reviews

```json
{
  "tripId": "uuid",
  "targetUserId": "uuid",
  "rating": 5,
  "comment": "Bạn đồng hành tuyệt vời!"
}
```

### Response – GET /reviews/user/:id

```json
{
  "data": [
    {
      "id": "uuid",
      "tripId": "uuid",
      "reviewerId": "uuid",
      "targetUserId": "uuid",
      "rating": 5,
      "comment": "Tuyệt vời!",
      "createdAt": "2026-05-19T06:00:00"
    }
  ],
  "total": 1,
  "averageRating": 5.0
}
```

## Business Rules

- Không tự review bản thân → `400 Bad Request`
- Không review 2 lần cùng 1 trip → `409 Conflict` (enforce ở cả Service + DB UniqueConstraint)
- Rating phải từ 1–5 → `400 Validation Failed`
- Comment không được rỗng, tối đa 500 ký tự
- Comment bị strip HTML tags trước khi lưu (chống XSS)

## Biến môi trường

| Biến | Default | Mô tả |
|------|---------|--------|
| `JWT_SECRET` | *(bắt buộc)* | Shared secret với Gateway |
| `REVIEW_DB_URL` | `jdbc:postgresql://localhost:5432/review_db` | PostgreSQL URL |
| `REVIEW_DB_USERNAME` | `postgres` | DB username |
| `REVIEW_DB_PASSWORD` | `secret` | DB password |

## Khởi chạy local

```bash
cd review-service
# Set env hoặc dùng .env
export JWT_SECRET=your-secret-here
./mvnw spring-boot:run
```

## Build & Test

```bash
./mvnw test           # Unit tests
./mvnw package        # Build JAR
docker build -t review-service .
```
