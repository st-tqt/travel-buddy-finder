# Báo cáo Kỹ thuật – TV2

## 1. Tổng quan phần TV2 phụ trách

  - **Trip Service**: quản lý chuyến đi (tạo, cập nhật, tìm kiếm).
  - **Join Request Service**: quản lý yêu cầu tham gia (xin join, duyệt/từ chối).

## 2. Kiến trúc Trip Service

  **2.1 Công nghệ sử dụng:**
    - Node.js 20 LTS + Express.js 4.x
    - PostgreSQL + Sequelize ORM
    - JWT authentication (TRUST_GATEWAY mode)
    - npm

  **2.2 Cấu trúc thư mục và vai trò từng file:**
    - `src/app.js`: Khởi tạo ứng dụng, cấu hình middlewares cơ bản và error handler.
    - `src/routes/trips.js`: Xử lý logic và định tuyến các endpoints (CRUD).
    - `src/models/Trip.js`: Định nghĩa schema bảng Trips, cấu hình các index và kết nối DB.
    - `src/middleware/errorHandler.js`: Middleware chuẩn hóa error response.

  **2.3 Database schema – bảng trips:**
    - `id` (UUID, PK)
    - `ownerId` (UUID, Not Null)
    - `title` (String 200, Not Null)
    - `description` (Text)
    - `location` (String 200, Not Null)
    - `startDate` (DateOnly, Not Null)
    - `endDate` (DateOnly, Not Null)
    - `maxMembers` (Integer, default 10)
    - `currentMember` (Integer, default 1)
    - `tags` (Array of String)
    - `isPublic` (Boolean, default true)
    - `status` (Enum: OPEN, CLOSED, COMPLETED, default OPEN)
    - `coverImage` (String)
    - `createdAt`, `updatedAt` (Date)
    - **Indexes**: ownerId, status, location, startDate, createdAt.

  **2.4 Business rules:**
    - `endDate` phải lớn hơn `startDate`. `startDate` không được trong quá khứ.
    - Chỉ owner mới có quyền update/delete trip của mình.
    - Trip sẽ tự động cập nhật `status = CLOSED` khi `currentMember >= maxMembers`.
    - Hỗ trợ filter và pagination tối ưu.

  **2.5 API endpoints đầy đủ:**
    | Method | Path         | Auth | Mô tả                    | Response Code  |
    |--------|--------------|------|--------------------------|----------------|
    | POST   | /trips       | Yes  | Tạo chuyến đi            | 201, 400, 401  |
    | GET    | /trips       | No   | Lấy danh sách (có filter)| 200            |
    | GET    | /trips/:id   | No   | Lấy chi tiết (kèm count) | 200, 404       |
    | GET    | /trips/my    | Yes  | Lấy ds chuyến đi của tôi | 200, 401       |
    | PUT    | /trips/:id   | Yes  | Cập nhật chuyến đi       | 200, 400, 403, 404 |
    | DELETE | /trips/:id   | Yes  | Xoá chuyến đi            | 204, 403, 404  |
    | GET    | /health      | No   | Health check             | 200            |

## 3. Kiến trúc Join Request Service

  **3.1 Công nghệ:** Tương tự Trip Service, bổ sung tích hợp RabbitMQ để gửi notification bất đồng bộ.

  **3.2 Database schema – bảng join_requests:**
    - `id` (UUID, PK)
    - `tripId` (UUID, Not Null)
    - `userId` (UUID, Not Null)
    - `status` (Enum: PENDING, APPROVED, REJECTED, default PENDING)
    - `message` (Text)
    - `createdAt`, `updatedAt` (Date)
    - **Indexes**: tripId, userId, status. Đặc biệt: `unique constraint (tripId, userId)` khi `status IN ('PENDING', 'APPROVED')` để ngăn duplicate DB level.

  **3.3 Business rules:**
    - User không được join trip của chính mình, không join trip đã đầy/đóng/hoàn thành.
    - Chặn request lặp lại khi đang pending hoặc approved.
    - Bảo vệ tính toàn vẹn dữ liệu khi có concurrent requests bằng Row-level lock (Sequelize transaction).

  **3.4 RabbitMQ Integration:**
    *Workflow Diagram:*
    `PUT /approve` → `JoinRequestService` 
                   → update DB (`status=approved`) 
                   → publish event `join.approved` 
                   → RabbitMQ Exchange (`join-request-events`) 
                   → `notification.queue` 
                   → `NotificationService` consume 
                   → tạo Notification record

    *Giải thích tại sao dùng async messaging:*
    - Loose coupling: Join Request Service hoạt động độc lập và không cần biết tới logic/nội tại của Notification Service.
    - Fault tolerance: Nếu Notification Service tạm ngưng, event vẫn được lưu bền bỉ trong hàng đợi.
    - Performance: Client nhận response ngay sau khi xử lý DB, không bị block chờ các tác vụ ngoài.

  **3.5 API endpoints đầy đủ:**
    | Method | Path                       | Auth | Mô tả                      | Response Code  |
    |--------|----------------------------|------|----------------------------|----------------|
    | POST   | /join-requests             | Yes  | Gửi yêu cầu tham gia       | 201, 400, 404, 409 |
    | GET    | /join-requests/my          | Yes  | Lấy request của tôi        | 200, 401       |
    | GET    | /join-requests?tripId=...  | Yes  | Danh sách theo trip        | 200, 400, 403, 404 |
    | PUT    | /join-requests/:id/approve | Yes  | Chủ trip duyệt request     | 200, 400, 403, 404 |
    | PUT    | /join-requests/:id/reject  | Yes  | Chủ trip từ chối request   | 200, 400, 403, 404 |
    | DELETE | /join-requests/:id         | Yes  | Hủy request đang pending   | 204, 400, 403, 404 |

## 4. Thách thức và giải pháp

  **4.1 Race condition khi approve đồng thời:**
    - **Thách thức:** Cùng lúc 2 hay nhiều Admin/Owner approve làm member vượt quá giới hạn max.
    - **Giải pháp:** Sử dụng tính năng transaction của Sequelize với tùy chọn `{ lock: true }` để lock row ở DB-level cho đến khi xử lý xong, đảm bảo không ai bị race condition ghi đè lên nhau.

  **4.2 Đồng bộ currentMember giữa 2 services:**
    - **Thách thức:** Trip Service và Join Request Service quản lý 2 database độc lập, nhưng logic cần update `currentMember` sau khi approve request.
    - **Giải pháp:** Join Request Service thực thi gọi internal HTTP qua API của Trip Service để update số lượng member sau khi lưu DB thành công.
    - **Trade-off:** Tạo coupling nhẹ giữa hai services thay vì fully-decoupled, bù lại giảm phức tạp cơ sở hạ tầng cho đồ án môn học.

  **4.3 RabbitMQ connection management:**
    - **Thách thức:** Nếu cấp connection mới mỗi lần call publish sẽ làm tràn resource (connection leak).
    - **Giải pháp:** Tối ưu bằng một instance connection duy nhất kết hợp tự động retry khi gặp lỗi, giúp kết nối luôn được pool tốt và phục hồi tự động (Auto-reconnect).

## 5. Kết quả đạt được

  - Tất cả các endpoint đều hoạt động chính xác với bảo mật và validation được siết chặt.
  - Các lỗi nhạy cảm không bị lộ ra bên ngoài qua cơ chế global error handler.
  - Test coverage: ~80%
  - Integration test: 4 flows (Happy path và Edge cases) pass 100%.

## 6. Hướng phát triển

  - Tích hợp Search full-text với Elasticsearch để nâng cao khả năng filter.
  - Bổ sung Trip recommendation system dựa trên hành vi tag của user.
  - Cronjob quét và notification tự động nhắc nhở khi sắp đến ngày khởi hành.
  - Thêm giới hạn/phân quyền nâng cao cho việc tạo quá nhiều Trip.
