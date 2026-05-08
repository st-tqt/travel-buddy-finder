# API Gateway

**Port:** `8080`  
**Phụ trách:** TV1 (Sprint 2)  
**Options:** Kong Gateway hoặc Spring Cloud Gateway

## Routing Rules (Sprint 2)

| Path Prefix | Service | Port |
|---|---|---|
| `/api/auth/*` | User Service | 8081 |
| `/api/users/*` | User Service | 8081 |
| `/api/trips/*` | Trip Service | 8082 |
| `/api/join-requests/*` | Join Request Service | 8083 |
| `/api/notifications/*` | Notification Service | 8084 |
| `/api/messages/*` | Chat Service | 8085 |
| `/api/reviews/*` | Review Service | 8086 |

## File cấu hình

- **Kong:** `kong.yml` (declarative config)
- **Spring Cloud Gateway:** `application.yml`

## WebSocket

> ⚠️ WebSocket cần cấu hình thêm để forward qua Gateway.
> Phương án dự phòng: Frontend kết nối WS trực tiếp `:8085`.
