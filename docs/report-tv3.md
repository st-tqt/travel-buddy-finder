# Báo cáo Kỹ thuật - TV3 (Backend Lead)

**Dự án:** Travel Buddy Finder  
**Sinh viên / Vai trò:** TV3 - Backend Lead  
**Công nghệ sử dụng:** Node.js 20 LTS, Express.js, PostgreSQL (Sequelize), JWT, RabbitMQ, Native WebSocket (`ws`).

---

## 1. Tổng quan Công việc
Trong đồ án môn học SOA (Kiến trúc hướng dịch vụ) "Travel Buddy Finder", tôi đảm nhận vai trò Backend Lead và trực tiếp phát triển 2 dịch vụ cốt lõi:
- **Notification Service** (Port 8084)
- **Chat Service** (Port 8085)

Ngoài ra, tôi còn chịu trách nhiệm thiết lập quy trình làm việc (Git Flow, Code Review), thiết kế Middleware xác thực (`shared/authMiddleware.js`) chuẩn TRUST_GATEWAY, tích hợp Message Queue và đảm bảo toàn hệ thống hoạt động thống nhất.

## 2. Chi tiết Triển khai và Hardening

### A. Notification Service
Dịch vụ này lưu trữ và phân phối thông báo cho người dùng, đồng thời hoạt động như một consumer của RabbitMQ để nhận các event từ hệ thống (ví dụ: `join.approved`, `join.rejected`).

**Các tính năng và Cải tiến Bảo mật:**
- **Authorization chặt chẽ:** Chỉ cho phép người dùng xem và cập nhật trạng thái "đã đọc" của chính các thông báo thuộc về họ. Ngăn chặn triệt để lỗ hổng leo thang đặc quyền (IDOR).
- **Input Validation:** Áp dụng kiểm tra UUID hợp lệ cho `userId`, đồng thời chuẩn hóa logic phân trang (`page`, `limit`) tránh các lỗi khai thác SQL Injection / DoS qua tham số.
- **RabbitMQ Error Handling:** 
  - Bắt lỗi JSON parsing và chủ động `ack` để drop các payload rác, tránh kẹt hàng đợi (queue blockage).
  - Chủ động `nack(msg, false, true)` để requeue nếu gặp lỗi kết nối hoặc thao tác Database.

### B. Chat Service
Dịch vụ này cung cấp khả năng nhắn tin theo thời gian thực (Real-time) cho các thành viên trong cùng một chuyến đi (Trip), hỗ trợ khả năng tải lịch sử tin nhắn.

**Các tính năng và Cải tiến Bảo mật (Production-ready):**
- **Native WebSocket:** Đã thực hiện việc migration từ `socket.io` sang thư viện thuần `ws` nhằm đạt hiệu năng cao nhất và dễ quản lý tài nguyên hơn trong môi trường microservices.
- **Message Validation:** Tất cả nội dung tin nhắn được chặn các ký tự HTML (phòng chống XSS), trim whitespace, và giới hạn độ dài tối đa 1000 ký tự.
- **Room Isolation:** Verify quyền truy cập phòng chat qua Trip Service. Chỉ người dùng đang ở trong chuyến đi mới được kết nối vào phòng WS tương ứng.
- **Memory Leak Prevention:** Lắng nghe tín hiệu `SIGTERM` của tiến trình để thực hiện "Graceful Shutdown" — đóng toàn bộ connections an toàn và xóa cache của Room Manager trước khi tắt server.
- **Connection Rate Limiting:** Giới hạn tối đa 50 connections trên một phòng để chống DDoS cấp ứng dụng và memory overflow.

### C. Standardized Error Handling
Nhằm duy trì API Contract nhất quán trong toàn dự án, tôi đã cấu trúc lại `errorHandler.js` dùng chung:
- Bất kỳ lỗi (throw Error) hoặc reject Promise nào trong các services của TV3 đều được map về mã HTTP Status tương ứng.
- JSON response đồng nhất định dạng: `{ "error": "message" }`.

## 3. Hoạt động Quản lý Nhóm
- Xây dựng file `api-contract.yaml` cho Backend/Frontend reference.
- Khởi tạo thư mục chuẩn, setup test CI và `package.json` base.
- Thực hiện Code Review hàng tuần, hợp nhất Pull Request từ TV1, TV2, TV4, TV5 vào nhánh `develop`.
- Triển khai Integration Test thành công trên 4 workflows chính của dự án.
- Merge code toàn bộ dự án vào nhánh `main` và đánh tag release.

## 4. Tổng kết
Các dịch vụ do TV3 phụ trách đã vượt qua mọi kịch bản kiểm thử (Postman Test Collection), giải quyết hoàn toàn các vấn đề bảo mật phổ biến (XSS, IDOR, Memory Leak), và sẵn sàng đáp ứng yêu cầu cho buổi demo cuối kỳ. Mọi chức năng giao tiếp liên dịch vụ qua REST và RabbitMQ đều đạt độ tin cậy cao.
