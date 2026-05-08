# Review Service (TV1 – Sprint 3)

**Port:** `8086`  
**Stack:** Java + Spring Boot + Spring Data JPA  
**Database:** PostgreSQL  
**Phụ trách:** TV1 (bắt đầu Sprint 3)

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/reviews` | Viết review sau chuyến đi | JWT |
| GET | `/reviews/user/:id` | Lấy review của user | Public |

## Khởi chạy local

```bash
cd review-service
./mvnw spring-boot:run
```
