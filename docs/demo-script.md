# Demo Script – Travel Buddy Finder

## Thứ tự demo (15-20 phút)

### 1. Giới thiệu kiến trúc (2 phút)
- Mở `docs/architecture.md` (nếu có) hoặc sơ đồ kiến trúc.
- Giải thích sơ đồ: 6 microservices (User, Trip, Join Request, Notification, Chat, Review), API Gateway Node.js, RabbitMQ để giao tiếp bất đồng bộ, và Docker Compose để quản lý container.
- Nhấn mạnh nguyên tắc: loose coupling (ràng buộc lỏng lẻo) và independent deployment (triển khai độc lập). Mỗi service có database riêng (Database per Service pattern).

### 2. Demo Auth flow (2 phút)
- Mở Postman, chạy request Register + Login.
- Giải thích: JWT được sinh ra ở User Service (viết bằng Java/Spring Boot), sau đó được verify ở API Gateway (Node.js) → Thể hiện khả năng cross-platform của JWT. Gateway sau khi verify sẽ bóc tách `userId` và `email` rồi forward vào headers `X-User-Id` và `X-User-Email` cho các service phía sau (TRUST_GATEWAY mode).

### 3. Demo Trip + Join Request flow (4 phút)
- User A tạo trip (`POST /trips`).
- User B gửi join request (`POST /join-requests`).
- User A duyệt request (`PUT /join-requests/:id/approve`).
- → Notification tự động xuất hiện cho User B.
- Giải thích: Sử dụng async communication qua RabbitMQ. Khi duyệt, Join Request Service publish event `join.approved` lên exchange `join-request-events`. Notification Service lắng nghe queue, consume event và tạo notification trong database của nó.

### 4. Demo Chat realtime (3 phút)
- Mở 2 terminal (hoặc 2 tab wscat/Postman WebSocket client).
- Cho cả 2 user kết nối cùng `tripId` qua API Gateway:
  `ws://localhost:3000/ws/chat?tripId=<id>&token=<jwt>`
- Chat qua lại realtime. Tin nhắn hiện lên lập tức ở phía bên kia.
- Giải thích: Sử dụng WebSocket (thư viện `ws` native của Node.js). Có `roomManager` để quản lý các phòng chat theo `tripId`, đảm bảo user ở trip nào chỉ nhận tin nhắn của trip đó. API Gateway có cấu hình http-proxy để upgrade connection HTTP lên WebSocket.

### 5. Demo Swagger UI (2 phút)
- Mở trình duyệt: `http://localhost:3000/api-docs`
- Giải thích: Sử dụng file `api-contract.yaml` làm "nguồn sự thật" (Single Source of Truth). Cả nhóm thống nhất API contract trước, sau đó phát triển song song (API-First Design) dựa trên contract này. Swagger UI được serve từ API Gateway.

### 6. Demo Docker Compose (2 phút)
- Mở terminal, gõ: `docker-compose ps`
- Hiển thị danh sách tất cả các containers đang running (gateway, các services, postgres dbs, rabbitmq, pgadmin...).
- Giải thích: Chỉ bằng 1 lệnh `docker-compose up -d`, toàn bộ hệ thống đồ án phức tạp được khởi động, đảm bảo môi trường dev/test/production nhất quán.

---

## 7. Câu hỏi thường gặp của giám khảo (Q&A)

**Q: Tại sao dùng RabbitMQ thay vì gọi trực tiếp (HTTP REST)?**
A: Để đạt được Loose coupling (ràng buộc lỏng lẻo). Join Request Service không cần biết Notification Service có tồn tại hay không. Nếu Notification Service bị sập (down), event vẫn được an toàn nằm trong message queue. Khi service khởi động lại, nó sẽ consume và xử lý bình thường, không làm mất dữ liệu.

**Q: API Gateway có trở thành điểm chết duy nhất (Single point of failure) không?**
A: Có, đây là một trade-off (sự đánh đổi) khi dùng API Gateway pattern. Trong môi trường Production thực tế, sẽ cần cài đặt Load Balancer phía trước nhiều instances của Gateway để đảm bảo High Availability. Với phạm vi đồ án, đây là một trade-off chấp nhận được.

**Q: Tại sao không dùng một database dùng chung (shared database) cho dễ?**
A: Chúng em áp dụng nguyên tắc "Database per Service" của kiến trúc Microservices. Mỗi service giữ dữ liệu riêng của nó, không ai được truy cập trực tiếp DB của người khác. Điều này giúp các service hoàn toàn độc lập, nếu một DB bị quá tải thì các service khác không bị ảnh hưởng (fault isolation), và hỗ trợ independent scaling.

**Q: JWT verify như thế nào khi TV1 dùng Java, TV2/TV3 dùng Node.js?**
A: JWT (JSON Web Token) là một tiêu chuẩn mở (RFC 7519). Payload là JSON và Signature dùng chung thuật toán (HS256) và chung một JWT_SECRET. Do đó, Java (thư viện jjwt) sinh ra token, Node.js (thư viện jsonwebtoken) vẫn verify bình thường.

---

## Phân công người trình bày (Demo Roles)

- **TV1 (Java/Gateway):** Giải thích phần User Service, cấu trúc API Gateway, cơ chế xác thực JWT cross-language.
- **TV2 (Trip/Join):** Trình diễn luồng (flow) tạo Trip, luồng Join Request, và thao tác publish event lên RabbitMQ.
- **TV3 (Leader/Chat/Notif):** Demo Notification sinh ra từ event, Chat WebSocket realtime, giải thích kiến trúc tổng thể.
- **TV4 (Frontend):** Trình diễn giao diện người dùng trên web (UI/UX) (nếu đã tích hợp xong).
- **TV5 (DevOps):** Mở terminal demo Docker Compose, show trạng thái containers, logs hệ thống.
