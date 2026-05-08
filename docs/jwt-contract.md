# JWT Payload Contract – Travel Buddy Finder

> **Định nghĩa bởi:** TV3 (Backend Lead)  
> **Áp dụng cho:** Tất cả 6 microservices

---

## Cấu trúc JWT Payload (chuẩn toàn nhóm)

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email":  "user@example.com",
  "iat":    1715000000,
  "exp":    1715604800
}
```

| Field    | Type     | Mô tả |
|----------|----------|-------|
| `userId` | `string` | UUID v4 của user trong bảng `users` (User Service DB) |
| `email`  | `string` | Email đăng nhập của user |
| `iat`    | `number` | Issued At – Unix timestamp (giây) |
| `exp`    | `number` | Expiration – Unix timestamp (giây) |

> **Không thêm bất kỳ field nào khác** vào payload mà không hỏi TV3 trước.

---

## Cách tạo JWT (TV1 – User Service)

```java
// JwtUtil.java (Spring Boot – TV1)
String token = Jwts.builder()
    .claim("userId", user.getId().toString())
    .claim("email",  user.getEmail())
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + expirationMs))
    .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
    .compact();
```

---

## Cách validate JWT (TV1 – Spring Boot)

```java
// JwtFilter.java
Claims claims = Jwts.parser()
    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
    .build()
    .parseSignedClaims(token)
    .getPayload();

String userId = claims.get("userId", String.class);
String email  = claims.get("email",  String.class);
```

### application.yml (TV1)

```yaml
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: ${JWT_EXPIRES_IN:7d}
```

---

## Cách validate JWT (TV2 & TV3 – Node.js)

Dùng `shared/middleware/authMiddleware.js`:

```js
const authMiddleware = require('../../shared/middleware/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
  // req.user.userId  ← UUID của user
  // req.user.email   ← email của user
  res.json({ userId: req.user.userId });
});
```

---

## Truyền token trong request

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### WebSocket (Chat Service – TV3)

```js
// Frontend kết nối WebSocket
const socket = io('http://localhost:8085', {
  path:  '/ws/chat',
  query: { tripId: 'uuid', token: 'jwt_token' }
});
```

---

## JWT_SECRET

- **1 secret duy nhất** dùng chung cho TẤT CẢ services
- Đặt trong `.env` (không commit lên Git)
- Xem `.env.example` để biết tên biến: `JWT_SECRET`

> ⚠️ **Không hardcode JWT_SECRET** trong source code bất kỳ service nào!
