# System Architecture

## Tổng quan
Travel Buddy Finder dùng kiến trúc Microservices với 6 services độc lập, giao tiếp qua REST API và RabbitMQ message queue.

## Sơ đồ kiến trúc
```text
                                  +-------------------+
                                  |    Client (UI)    |
                                  | (ReactJS + Vite)  |
                                  +--------+----------+
                                           | HTTP
                                           v
                                  +-------------------+
                                  |   API Gateway     |
                                  |    (Node.js)      |
                                  +--------+----------+
                                           |
       +---------------+-------------------+-------------------+---------------+
       |               |                   |                   |               |
       v               v                   v                   v               v
+-------------+ +-------------+    +-------------+     +-------------+ +--------------+
| User Service| | Trip Service|    |Join Request |     | Chat Service| |Review Service|
| (Spring Boot| |  (Node.js)  |    |  (Node.js)  |     |  (Node.js)  | | (Spring Boot)|
+------+------+ +------+------+    +------+------+     +------+------+ +------+-------+
       |               |                  |                   |               |
       |  +----------+ |   +----------+   |                   |               |
       +->| RabbitMQ |<+   | RabbitMQ |<--+                   |               |
          | (Events) |---->| (Events) |                       |               |
          +----------+     +----------+                       |               |
               |                  |                           |               |
               |                  v                           |               |
               |           +-------------+                    |               |
               +---------->|Notification |                    |               |
                           |  (Node.js)  |                    |               |
                           +------+------+                    |               |
                                  |                           |               |
                                  v                           v               v
    +---------+ +---------+ +---------+ +-------------+ +---------+ +----------+
    | user-db | | trip-db | | join-db | |notificat-db | | chat-db | |review-db |
    | (PGSQL) | | (PGSQL) | | (PGSQL) | |   (PGSQL)   | | (PGSQL) | |  (PGSQL) |
    +---------+ +---------+ +---------+ +-------------+ +---------+ +----------+
```

## Giao tiếp giữa services
- Đồng bộ (REST): Client → API Gateway → Services
- Bất đồng bộ (RabbitMQ): Join Request → Notification Service

## Công nghệ sử dụng
| Lớp / Phần | Công nghệ | Mục đích / Vai trò |
|---|---|---|
| Frontend | ReactJS 18, Vite | Giao diện người dùng |
| Backend API | Node.js 20, Java (Spring Boot) | Cung cấp logic API xử lý nghiệp vụ cho từng microservice |
| Database | PostgreSQL 15 | Cơ sở dữ liệu quan hệ độc lập (Database per Service) |
| Message Broker | RabbitMQ | Hệ thống gửi/nhận message bất đồng bộ (Notification, Event...) |
| DevOps & Build | Docker, Docker Compose | Container hóa và chạy môi trường nội bộ dễ dàng |
| CI/CD Pipeline | GitHub Actions | Tự động hóa quá trình kiểm thử và build Docker |

## Quyết định thiết kế
- **Tại sao dùng Docker Compose thay Eureka:** Để đơn giản hóa môi trường phát triển (local environment) và tự động sử dụng Docker DNS nội bộ của Docker Compose cho Service Discovery, giúp team nhỏ (5 người) tiết kiệm thời gian setup server Eureka riêng lẻ.
- **Tại sao mỗi service có DB riêng:** Tuân thủ mô hình "Database per Service" của kiến trúc Microservices. Giúp các service tách rời hoàn toàn về mặt dữ liệu, nếu một DB bị lỗi/quá tải cũng không ảnh hưởng trực tiếp tới DB của service khác.
- **Tại sao dùng RabbitMQ cho notification:** Cơ chế xử lý bất đồng bộ, giúp cho request từ phía client (như xin tham gia nhóm) được phản hồi nhanh chóng mà không cần phải đợi hệ thống thông báo xử lý xong.
