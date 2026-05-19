# Báo cáo Kỹ thuật – TV1 (Backend Lead)

> **Dự án:** Travel Buddy Finder – Tìm bạn du lịch  
> **Thành viên:** TV1 – Backend Developer  
> **Phạm vi phụ trách:** User Service · Review Service · API Gateway  
> **Stack:** Java 17/21 + Spring Boot 3.2 · Node.js · PostgreSQL · Maven

---

## 1. Tổng quan phần TV1 phụ trách

| Component | Chức năng chính | Công nghệ | Port |
|---|---|---|---|
| **User Service** | Đăng ký, đăng nhập, JWT, lấy thông tin user | Java 17 + Spring Boot 3.2 + PostgreSQL | 8081 |
| **Review Service** | Đánh giá sau chuyến đi, tổng hợp điểm | Java 21 + Spring Boot 3.2 + PostgreSQL | 8086 |
| **API Gateway** | Routing, JWT verify, rate limit, logging | Node.js + Express | 3000 |

### Endpoints TV1 phụ trách

**User Service:**

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/auth/register` | Public | Đăng ký tài khoản mới |
| POST | `/auth/login` | Public | Đăng nhập, nhận JWT |
| GET | `/users/:id` | Bearer JWT | Lấy thông tin user theo ID |
| GET | `/health` | Public | Health check |

**Review Service:**

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/reviews` | Bearer JWT | Tạo đánh giá sau chuyến đi |
| GET | `/reviews/user/:id` | Public | Lấy tất cả reviews của một user |
| GET | `/health` | Public | Health check |

**API Gateway (routes tổng hợp):**

| Path | Method | Target Service | Auth Required |
|------|--------|----------------|---------------|
| `/api/auth/*` | POST | user-service:8081 | ❌ (+ strict rate limit) |
| `/api/users/*` | GET | user-service:8081 | ✅ JWT |
| `/api/trips` | GET | trip-service:8082 | ❌ |
| `/api/trips/:id` | GET | trip-service:8082 | ❌ |
| `/api/trips/*` | ALL | trip-service:8082 | ✅ JWT |
| `/api/join-requests/*` | ALL | join-request-service:8083 | ✅ JWT |
| `/api/notifications/*` | ALL | notification-service:8084 | ✅ JWT |
| `/api/messages/*` | ALL | chat-service:8085 | ✅ JWT |
| `/api/reviews/user/:id` | GET | review-service:8086 | ❌ |
| `/api/reviews` | POST | review-service:8086 | ✅ JWT |
| `/api-docs` | GET | Gateway (Swagger UI) | ❌ |

---

## 2. Kiến trúc User Service

### 2.1 Công nghệ sử dụng

| Thành phần | Công nghệ | Version |
|---|---|---|
| Ngôn ngữ | Java | 17 |
| Framework | Spring Boot | 3.2.5 |
| ORM | Spring Data JPA + Hibernate | - |
| Bảo mật | Spring Security (Stateless) | - |
| Database | PostgreSQL | 15+ |
| JWT | jjwt (io.jsonwebtoken) | 0.12.5 |
| Password hashing | BCryptPasswordEncoder | strength=10 |
| Build | Maven | 3.x |
| Container | Docker | - |

### 2.2 Cấu trúc package

```
com.travelbuddy.user
├── controller/
│   ├── AuthController.java     ← POST /auth/register, POST /auth/login
│   └── UserController.java     ← GET /users/:id, GET /health
├── service/
│   ├── AuthService.java        ← Interface
│   ├── UserService.java        ← Interface
│   └── impl/
│       ├── AuthServiceImpl.java   ← business logic: register, login
│       └── UserServiceImpl.java   ← getUserById
├── repository/
│   └── UserRepository.java     ← JPA: findByEmail, existsByEmail
├── model/
│   └── User.java               ← @Entity: id, email, password(@JsonIgnore), name, bio, tags, createdAt
├── dto/
│   ├── RegisterRequest.java    ← @NotBlank, @Email, @Size(min=6)
│   ├── LoginRequest.java       ← email, password
│   ├── UserDTO.java            ← id, name, email, bio, tags, createdAt (KHÔNG có password)
│   └── AuthResponse.java       ← accessToken + UserInfo{id, name, email}
├── exception/
│   ├── GlobalExceptionHandler.java    ← @RestControllerAdvice
│   ├── EmailAlreadyExistsException.java
│   ├── InvalidCredentialsException.java
│   └── UserNotFoundException.java
└── security/
    ├── JwtUtil.java            ← generateToken(), parseToken()
    ├── JwtFilter.java          ← OncePerRequestFilter, verify JWT
    ├── RateLimitFilter.java    ← In-memory rate limit: login 5/min, register 3/min
    └── SecurityConfig.java     ← Filter chain: RateLimit → JWT → UsernamePassword
```

**Mô tả từng layer:**
- **controller**: Nhận HTTP request, validate input (`@Valid`), gọi service, trả JSON response. Không chứa business logic.
- **service**: Business logic (hash password, check duplicate email, generate JWT). Tách interface–impl để dễ mock test.
- **repository**: Tương tác DB qua JPA. Spring Data tự sinh SQL parameterized query → tránh SQL injection.
- **model**: JPA Entity, map sang bảng `users`. `@JsonIgnore` trên `password` đảm bảo không bao giờ trả về client.
- **dto**: Data Transfer Objects – tách biệt model DB và response. `UserDTO` không có `password`.
- **security**: `JwtFilter` verify token mỗi request, gắn userId vào SecurityContext. `RateLimitFilter` giới hạn brute-force.

### 2.3 Database Schema – bảng `users`

```sql
CREATE TABLE users (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL UNIQUE,   -- index tự động (UNIQUE)
    password   VARCHAR(255) NOT NULL,           -- BCrypt hash, không bao giờ trả client
    name       VARCHAR(255) NOT NULL,
    bio        TEXT,
    tags       JSONB        DEFAULT '[]',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Index email đã có qua UNIQUE constraint
-- JSONB tags cho phép filter linh hoạt (TV1 Matching API)
```

### 2.4 JWT Implementation

| Thông tin | Giá trị |
|---|---|
| Thuật toán | HS256 (HMAC-SHA256) |
| Payload | `{ userId: UUID, email: string, iat: epoch, exp: epoch }` |
| Expiration | 7 ngày (cấu hình qua `JWT_EXPIRES_IN`) |
| Secret | Env var `JWT_SECRET` (không hardcode) |
| Thư viện Java | jjwt 0.12.5 |
| Thư viện Node.js | jsonwebtoken 9.x |

**Lý do chọn HS256:** Symmetric key đơn giản, phù hợp đồ án quy mô nhóm nhỏ. Token sinh bởi Java (jjwt) verify được tại Node.js (jsonwebtoken) khi dùng cùng secret và algorithm.

### 2.5 Flow xác thực

```
┌─────────┐     POST /auth/login      ┌──────────────┐
│  Client │ ─────────────────────────▶│  UserService │
└─────────┘   {email, password}       └──────┬───────┘
                                             │ 1. findByEmail()
                                             │ 2. BCrypt.matches(raw, hash)
                                             │ 3. jwtUtil.generateToken(userId, email)
                                             ▼
                                    ◀── { accessToken: "eyJ..." }

┌─────────┐   GET /users/:id           ┌─────────────┐    ┌──────────────┐
│  Client │  Authorization: Bearer ... │  JwtFilter  │    │  Controller  │
└─────────┘ ─────────────────────────▶│  verify()   │───▶│  getUserById │
                                       │  attach     │    └──────────────┘
                                       │  userId to  │
                                       │ SecurityCtx │
                                       └─────────────┘
```

---

## 3. Kiến trúc Review Service

### 3.1 Công nghệ sử dụng

Tương tự User Service, nhưng Java 21 và không có module Security phức tạp (JWT verify được delegate từ Gateway qua header `X-User-Id`).

### 3.2 Business Rules

| Rule | Implementation |
|---|---|
| Không tự review bản thân | `if (reviewerId.equals(targetUserId)) → 400 BAD_REQUEST` |
| Không review 2 lần cùng 1 trip | `existsByReviewerIdAndTripIdAndTargetUserId() → 409 CONFLICT` (+ DB UniqueConstraint) |
| Rating phải từ 1–5 | `@Min(1) @Max(5)` trên field `rating` |
| Comment không được rỗng | `@NotBlank` + max 500 ký tự |
| Comment sanitization | Strip HTML tags → ngăn XSS |
| AverageRating | Tính tại DB layer: `SELECT AVG(rating)` – hiệu quả hơn load all |

### 3.3 Database Schema – bảng `reviews`

```sql
CREATE TABLE reviews (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID         NOT NULL,
    reviewer_id     UUID         NOT NULL,
    target_user_id  UUID         NOT NULL,
    rating          INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         VARCHAR(500) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_reviewer_trip_target
        UNIQUE (reviewer_id, trip_id, target_user_id), -- Ngăn review 2 lần ở DB level

    INDEX idx_review_target_user  (target_user_id),     -- Query GET /reviews/user/:id
    INDEX idx_review_reviewer_trip (reviewer_id, trip_id)
);
```

---

## 4. Kiến trúc API Gateway

### 4.1 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express 4.x |
| Proxy | http-proxy-middleware 2.x |
| JWT | jsonwebtoken 9.x |
| Security Headers | helmet 7.x |
| Compression | compression 1.x |
| Rate Limiting | express-rate-limit 7.x |
| API Docs | swagger-ui-express 5.x |
| Request Tracing | uuid 9.x (X-Request-Id) |

### 4.2 Middleware Stack

```
Request
  │
  ▼ helmet()              ← Security headers (X-Content-Type, HSTS, CSP, ...)
  ▼ compression()         ← Gzip response (~70% size reduction)
  ▼ cors()                ← Cross-origin resource sharing
  ▼ express.json({10kb})  ← Body parser + size limit (ngăn request bomb)
  ▼ requestId middleware  ← Gán UUID X-Request-Id mỗi request
  ▼ logger middleware     ← Log: reqId method url status duration
  ▼ generalLimiter        ← 100 req / 15 phút / IP
  ▼ [authLimiter]         ← 10 req / 15 phút / IP (chỉ /api/auth/*)
  ▼ [verifyJwt]           ← Verify Bearer token (chỉ protected routes)
  ▼ proxy to service      ← Forward + X-User-Id + X-Request-Id headers
```

### 4.3 JWT Verification tại Gateway

**Lý do verify tập trung tại Gateway thay vì từng service:**
- **Single Responsibility**: Mỗi service không cần implement lại JWT logic
- **Giảm duplicate code**: Một nơi thay đổi secret/algorithm → áp dụng toàn hệ thống
- **Services nội bộ tin tưởng header**: Sau khi Gateway verify xong, forward `X-User-Id` → service chỉ cần đọc header, không cần verify lại
- **Centralized audit log**: Mọi auth failure đều được log tại Gateway với Request ID

### 4.4 Error Handling Strategy

| Tình huống | HTTP Status | Response |
|---|---|---|
| Route không tồn tại | 404 | `{ "error": "Route not found" }` |
| Không có token | 401 | `{ "error": "Missing or invalid Authorization header" }` |
| Token hết hạn / invalid | 401 | `{ "error": "Invalid or expired token" }` |
| Service downstream down | 503 | `{ "error": "Service temporarily unavailable" }` |
| Service timeout | 503 | `{ "error": "Service temporarily unavailable" }` |
| Bad gateway (5xx) | 502 | `{ "error": "Bad gateway" }` |
| Rate limit exceeded | 429 | `{ "error": "Too many requests..." }` |

---

## 5. Thách thức và Giải pháp

### 5.1 Cross-platform JWT (Java ↔ Node.js)

**Thách thức:** TV1 dùng Java (jjwt 0.12.5), Gateway và TV2/TV3 dùng Node.js (jsonwebtoken). Hai thư viện khác nhau cần tương thích.

**Giải pháp:**
- Thống nhất thuật toán: **HS256**
- Thống nhất payload format: `{ userId: string, email: string, iat: number, exp: number }`
- Dùng chung `JWT_SECRET` qua env variable
- Document trong `docs/jwt-contract.md`

**Kết quả:** Token sinh bởi Java verify được tại Gateway Node.js và ngược lại. Integration test flow 1-4 pass.

### 5.2 API Gateway Single Point of Failure

**Thách thức:** Gateway down → toàn hệ thống down.

**Giải pháp trong đồ án:**
- `restart: on-failure` trong Docker Compose
- Health check endpoint `/health` cho monitoring
- Timeout 10 giây → 503 thân thiện thay vì hang

**Production solution:** Load balancer (Nginx/HAProxy) + multiple Gateway instances + Circuit Breaker (Resilience4j).

### 5.3 Service Timeout Handling

**Thách thức:** Service downstream không trả lời (cold start Docker, GC pause).

**Giải pháp:** `proxyTimeout: 10000ms` + `timeout: 10000ms` tại http-proxy-middleware. Nếu ETIMEDOUT/ECONNRESET/ECONNREFUSED → 503 với message thân thiện.

### 5.4 Rate Limiting Brute Force

**Thách thức:** `/auth/login` không có giới hạn → brute force password.

**Giải pháp:**
- **Gateway level:** authLimiter 10 req/15 phút/IP cho `/api/auth/*`
- **Service level:** `RateLimitFilter` (Spring Filter) – login 5/phút, register 3/phút
- Defense in depth: cả hai layer → một layer bypass vẫn còn layer kia

---

## 6. Kết quả đạt được

### 6.1 Endpoint Status

| Endpoint | Method | Status | Test Result |
|---|---|---|---|
| `/auth/register` | POST | ✅ Done | Pass |
| `/auth/login` | POST | ✅ Done | Pass |
| `/users/:id` | GET | ✅ Done | Pass |
| `/users/:id` (no token) | GET | ✅ 401 | Pass |
| `/reviews` | POST | ✅ Done | Pass |
| `/reviews` (self) | POST | ✅ 400 | Pass |
| `/reviews` (duplicate) | POST | ✅ 409 | Pass |
| `/reviews/user/:id` | GET | ✅ Done | Pass |
| `/health` (user-service) | GET | ✅ 200 | Pass |
| `/health` (review-service) | GET | ✅ 200 | Pass |

### 6.2 Security Checklist

| Item | Status |
|---|---|
| Password không trả về client (`@JsonIgnore`) | ✅ |
| BCrypt password hashing | ✅ |
| JWT expiration (7 ngày) | ✅ |
| Rate limiting auth endpoints (Gateway + Service) | ✅ |
| Email trim + normalize (lowercase) | ✅ |
| Whitespace-only password rejected | ✅ |
| Comment sanitization (strip HTML) | ✅ |
| Helmet security headers | ✅ |
| Request body size limit (10kb) | ✅ |
| No hardcoded secrets (env vars) | ✅ |
| No password/token in logs | ✅ |
| Parameterized queries (JPA default) | ✅ |

### 6.3 Unit Test Coverage

| Service | Coverage |
|---|---|
| User Service | ~80% (AuthServiceImpl, UserServiceImpl) |
| Review Service | ~75% (ReviewService) |

*(Điền số thực tế sau khi chạy `mvn test` + jacoco report)*

---

## 7. Hướng Phát Triển (nếu có thêm thời gian)

| Feature | Mô tả | Độ ưu tiên |
|---|---|---|
| Refresh Token | Token ngắn hạn (15 phút) + refresh token (30 ngày) | 🔴 Cao |
| Email Verification | Gửi email verify khi đăng ký | 🟡 Trung bình |
| OAuth2 Google | Đăng nhập bằng Google | 🟡 Trung bình |
| Rate limit per user | Không chỉ per IP (dùng userId trong JWT) | 🟡 Trung bình |
| Horizontal Gateway scaling | Load balancer + nhiều Gateway instances | 🟢 Thấp |
| Redis-backed rate limit | Thay in-memory → Redis để scale across instances | 🟢 Thấp |
