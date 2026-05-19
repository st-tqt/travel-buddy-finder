# User Service – TV1

**Port:** `8081`  
**Stack:** Java 17 + Spring Boot 3.2.5 + Spring Security + Spring Data JPA  
**Database:** PostgreSQL (`user_db`)  
**Auth:** JWT HS256 (jjwt 0.12.5)  
**Phụ trách:** TV1

---

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/auth/register` | Đăng ký tài khoản | Public |
| POST | `/auth/login` | Đăng nhập → trả JWT | Public |
| GET | `/users/{id}` | Lấy thông tin user | JWT Bearer |

---

## 🔐 JWT Contract – QUAN TRỌNG (TV2 & TV3 đọc kỹ)

### Thuật toán & Secret

| Thuộc tính | Giá trị |
|-----------|---------|
| Thuật toán | **HS256** |
| Secret | `JWT_SECRET` từ `.env` (dùng chung toàn nhóm) |
| Thời hạn | `JWT_EXPIRES_IN` (mặc định `7d`) |

### Cấu trúc Payload

```json
{
  "userId" : "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email"  : "user@example.com",
  "iat"    : 1715000000,
  "exp"    : 1715604800
}
```

> ⚠️ **Key phải đúng chính xác:**  
> - `"userId"` (không phải `"sub"`, không phải `"user_id"`)  
> - `"email"` (không phải `"userEmail"`)

### TV2 & TV3 (Node.js) verify token

```js
const jwt = require('jsonwebtoken')

// Verify và decode
const decoded = jwt.verify(token, process.env.JWT_SECRET)

// Lấy thông tin
const userId = decoded.userId   // UUID string
const email  = decoded.email    // email string
```

### TV1 (Java Spring Boot) sinh token

```java
// JwtUtil.java – generateToken()
Jwts.builder()
    .claim("userId", userId.toString())  // UUID → String
    .claim("email",  email)
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + expirationMs))
    .signWith(secretKey, Jwts.SIG.HS256)
    .compact();
```

### Cách đính kèm token trong request

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Cấu trúc package

```
src/main/java/com/travelbuddy/user/
├── controller/
│   ├── AuthController.java      ← POST /auth/register, POST /auth/login
│   └── UserController.java      ← GET /users/{id}
├── service/
│   ├── AuthService.java         ← interface
│   ├── UserService.java         ← interface
│   └── impl/
│       ├── AuthServiceImpl.java ← BCrypt + JWT generation
│       └── UserServiceImpl.java ← findById
├── repository/
│   └── UserRepository.java      ← findByEmail, existsByEmail
├── model/
│   └── User.java                ← JPA Entity (id, email, password, name, bio, tags, createdAt)
├── dto/
│   ├── RegisterRequest.java     ← name, email, password, bio?, tags?
│   ├── LoginRequest.java        ← email, password
│   ├── AuthResponse.java        ← accessToken, user{id,name,email}
│   └── UserDTO.java             ← id, name, email, bio, tags, createdAt
├── security/
│   ├── JwtUtil.java             ← generate + verify token (HS256)
│   ├── JwtFilter.java           ← OncePerRequestFilter, set SecurityContext
│   └── SecurityConfig.java      ← stateless, /auth/** public
└── exception/
    ├── EmailAlreadyExistsException.java
    ├── InvalidCredentialsException.java
    ├── UserNotFoundException.java
    └── GlobalExceptionHandler.java  ← @RestControllerAdvice
```

---

## Khởi chạy local

### Yêu cầu
- Java 17+
- Maven 3.8+
- PostgreSQL đang chạy trên port 5432

### Setup

```bash
# 1. Copy env và điền giá trị
cp ../.env.example ../.env

# Các biến cần thiết:
# USER_DB_URL=jdbc:postgresql://localhost:5432/user_db
# USER_DB_USERNAME=postgres
# USER_DB_PASSWORD=your_password
# JWT_SECRET=your_very_long_secret_at_least_32_chars
# JWT_EXPIRES_IN=7d

# 2. Tạo database
psql -U postgres -c "CREATE DATABASE user_db;"

# 3. Chạy service
./mvnw spring-boot:run
# Hoặc:
./mvnw package -DskipTests && java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

### Chạy với Docker

```bash
docker build -t user-service .
docker run -p 8081:8081 \
  -e JWT_SECRET=your_secret \
  -e USER_DB_URL=jdbc:postgresql://host.docker.internal:5432/user_db \
  -e USER_DB_USERNAME=postgres \
  -e USER_DB_PASSWORD=your_password \
  user-service
```

---

## Test nhanh bằng curl

```bash
# 1. Register
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "password": "secret123",
    "bio": "Thích đi phượt",
    "tags": ["backpacker"]
  }'
# → 201 { id, name, email, bio, tags, createdAt }

# 2. Login → lấy token
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenvana@example.com","password":"secret123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 3. Get user (cần thay UUID thực tế)
curl http://localhost:8081/users/<UUID> \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection

File: `postman-collection.json`

Import vào Postman, chạy theo thứ tự:
1. **Register** → copy `id` vào biến `userId`
2. **Login** → token tự động lưu vào biến `token`
3. **Get User by ID** → dùng token từ bước 2

---

## Error Responses

Tất cả lỗi trả về format thống nhất:

```json
{
  "error": "ERROR_CODE",
  "message": "Mô tả lỗi chi tiết"
}
```

| HTTP | Error Code | Tình huống |
|------|-----------|-----------|
| 400 | `EMAIL_ALREADY_EXISTS` | Email đã đăng ký |
| 400 | `VALIDATION_FAILED` | Input không hợp lệ |
| 401 | `INVALID_CREDENTIALS` | Sai email/password |
| 401 | `UNAUTHORIZED` | Token thiếu hoặc hết hạn |
| 404 | `USER_NOT_FOUND` | Không tìm thấy user |
| 500 | `INTERNAL_ERROR` | Lỗi server |
