# User Service (TV1)

**Port:** `8081`  
**Stack:** Java 17 + Spring Boot 3.x + Spring Security + Spring Data JPA  
**Database:** PostgreSQL (riêng – `user_db`)  
**Phụ trách:** TV1

---

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/auth/register` | Đăng ký tài khoản | Public |
| POST | `/auth/login` | Đăng nhập → trả JWT | Public |
| GET | `/users/:id` | Lấy thông tin user | JWT Bearer |

## Cấu trúc package

```
src/main/java/com/travelbuddy/user/
├── controller/
│   ├── AuthController.java    ← POST /auth/register, POST /auth/login
│   └── UserController.java    ← GET /users/:id
├── service/
│   └── AuthService.java
├── repository/
│   └── UserRepository.java
├── model/
│   └── User.java              ← JPA Entity
├── dto/                       ← TODO TV1: tạo RegisterRequest, LoginRequest, UserDTO
├── security/                  ← TODO TV1: JwtFilter.java, SecurityConfig.java
└── UserServiceApplication.java
```

## JWT Filter (TV1 phải tự viết)

TV3 (leader) quy định payload JWT chuẩn toàn nhóm:

```json
{
  "userId": "uuid-v4",
  "email":  "user@example.com",
  "iat":    1715000000,
  "exp":    1715604800
}
```

`JwtFilter.java` phải:
1. Đọc `Authorization: Bearer <token>` header
2. Verify token với `JWT_SECRET` (từ `application.yml` → `app.jwt.secret`)
3. Gán `SecurityContextHolder` để Spring Security nhận diện user
4. Set `userId` và `email` vào request attribute để controller dùng

### application.yml – cấu hình JWT

```yaml
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: ${JWT_EXPIRES_IN:7d}
```

## Khởi chạy local

```bash
# Prerequisite: PostgreSQL chạy trên port 5432
# Copy env
cp ../.env.example ../.env   # điền USER_DB_URL, USER_DB_USERNAME, USER_DB_PASSWORD, JWT_SECRET

# Chạy với Maven Wrapper
./mvnw spring-boot:run

# Hoặc build JAR
./mvnw package -DskipTests
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

## Chạy với Docker

```bash
docker build -t user-service .
docker run -p 8081:8081 --env-file ../.env user-service
```

## Test nhanh

```bash
# Register
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","fullName":"Test User"}'

# Login → lấy token
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```
