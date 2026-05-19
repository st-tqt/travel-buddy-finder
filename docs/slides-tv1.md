# Nội dung Slide Demo – TV1

> Mỗi section = 1 slide. TV5 copy vào PowerPoint/Google Slides.

---

## SLIDE 1 – User Service Overview

**Title:** User Service – Authentication & Authorization

- Tech: Java 17 + Spring Boot 3.2 + PostgreSQL + BCrypt + jjwt 0.12.5
- Endpoints: `POST /auth/register` · `POST /auth/login` · `GET /users/:id`
- Password KHÔNG BAO GIỜ trả client (`@JsonIgnore`)

**Login Flow:**
```
Client ──POST /auth/login──▶ UserService
                               ├─ findByEmail()
                               ├─ BCrypt.matches()
                               └─ jwtUtil.generateToken()
Client ◀────────── { accessToken: "eyJ..." }
```

---

## SLIDE 2 – JWT Cross-Platform: Java ↔ Node.js

**Title:** JWT Đồng nhất Java & Node.js

**Vấn đề:** User Service (Java jjwt) + Gateway/TV2/TV3 (Node.js jsonwebtoken) – khác runtime.

**Giải pháp:** Thống nhất Algorithm=HS256 + Shared `JWT_SECRET` + Payload format.

```java
// Sinh token – Java
String token = Jwts.builder()
    .claim("userId", userId.toString())
    .claim("email", email)
    .signWith(secretKey)  // HS256
    .compact();
```

```javascript
// Verify – Node.js
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256']
}); // decoded.userId, decoded.email
```

**Kết quả:** Token Java → verify tại Gateway Node.js ✅ Integration test flow 1-4 pass.

---

## SLIDE 3 – API Gateway: Single Entry Point

**Title:** API Gateway – Cổng vào duy nhất

```
Client ──▶ API GATEWAY :3000 (Node.js + Express)
               │ 🛡 Helmet headers
               │ ⚡ Rate limit (10/15min auth · 100/15min general)
               │ 🔑 JWT verify → X-User-Id header
               │ 📝 Request ID tracing
               ├──▶ user-service   :8081
               ├──▶ trip-service   :8082
               ├──▶ join-service   :8083
               ├──▶ notif-service  :8084
               └──▶ review-service :8086
```

- Swagger UI: `http://localhost:3000/api-docs` *(chụp screenshot chèn vào đây)*
- 503 khi service down, 401 khi không có token, 404 khi route sai

---

## SLIDE 4 – Review Service

**Title:** Review Service – Đánh giá sau chuyến đi

**Business Rules (enforce ở cả Service & DB):**

| Rule | Implementation |
|---|---|
| Không tự review | `reviewerId.equals(targetUserId)` → 400 |
| Không review 2 lần | `existsByReviewer...()` → 409 + DB UniqueConstraint |
| Rating 1–5 | `@Min(1) @Max(5)` → 400 |
| Strip HTML comment | `replaceAll("<[^>]*>", "")` |

**AverageRating tính tại DB:**
```java
@Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetUserId = :userId")
Double findAverageRatingByTargetUserId(@Param("userId") UUID userId);
```

**Demo:** `POST /api/reviews` → `GET /api/reviews/user/:id` → `{ total: 3, averageRating: 4.7 }`

---

## SLIDE 5 – Security Highlights

**Title:** Bảo mật đa lớp – Defense in Depth

| Layer | Biện pháp |
|---|---|
| **API Gateway** | Helmet headers · Rate limit · Body 10KB limit · JWT verify |
| **User Service** | BCrypt hashing · RateLimitFilter · Email normalize · @JsonIgnore |
| **Review Service** | Comment sanitize (strip HTML) · DB UniqueConstraint · Auth required |

**Checklist:**
- ✅ BCrypt password hashing (strength=10)
- ✅ JWT expiration (7 ngày)
- ✅ Rate limiting (2 layers: Gateway + Service)
- ✅ Helmet security headers
- ✅ Input validation + HTML sanitization
- ✅ No hardcoded secrets
- ✅ No stack trace in response
- ✅ Password never in logs or response

---

> **Ghi chú TV5:** Slide 3 chụp màn hình Swagger UI live. Demo thứ tự: Login → JWT explain → Gateway → Review → Security.
