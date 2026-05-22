# Travel Buddy Finder – Frontend Application

Ứng dụng Frontend dành cho dự án **Travel Buddy Finder**, được phát triển bằng React 18, Vite và Tailwind CSS. Đây là giao diện người dùng chính của hệ thống giúp kết nối các phượt thủ và những người đam mê dịch chuyển, cho phép họ tìm kiếm bạn đồng hành, tạo chuyến đi, gửi yêu cầu tham gia, trò chuyện trực tuyến và đánh giá bạn đồng hành sau mỗi chuyến đi.

---

## 🚀 Công Nghệ Sử Dụng

- **Core & Build Tools**:
  - **React 18 / 19**
  - **Vite** (Công cụ đóng gói và HMR cực nhanh)
  - **Tailwind CSS v3** (Thiết kế giao diện đáp ứng, hiện đại)
  - **React Router DOM v7** (Quản lý routing, Protected Route)
- **API & State Management**:
  - **Axios** (Gửi request HTTP kèm Auth Interceptor tự động gắn JWT Token)
  - **AuthContext** (Quản lý trạng thái đăng nhập, phân quyền, tự động kiểm tra thời hạn token)
- **Realtime & Utilities**:
  - **WebSocket native** (Kết nối realtime cho kênh chat của chuyến đi và cơ chế tự động reconnect)
  - **use-debounce** (Debounce ô tìm kiếm giúp giảm tải cho server)
  - **react-hot-toast** (Hiển thị các thông báo đẹp mắt, mượt mà)

---

## ✨ Các Tính Năng Chính (Hoàn Thành Trong Sprint 4)

1. **Authentication & Authorization**:
   - Đăng nhập/Đăng ký với validation chặt chẽ.
   - Cơ chế lưu trạng thái login an toàn vào `localStorage` cùng hàm giải mã kiểm tra thời hạn JWT (`exp * 1000`). Tự động logout khi token hết hạn.
   - Trang bảo vệ (`ProtectedRoute`) lưu giữ trạng thái chuyển hướng (`from: location`) để dẫn người dùng quay lại trang họ đang truy cập trước khi đăng nhập.
2. **Trang Chủ (Home & Search)**:
   - Danh sách chuyến đi hỗ trợ phân trang ở phía máy chủ (Server-side Pagination).
   - Tìm kiếm điểm đến (Location) kết hợp Debounce (500ms) để tối ưu số lần gọi API.
   - Tích hợp **Skeleton Loader** khi tải dữ liệu và trạng thái trống **EmptyState** trực quan.
3. **Chi Tiết Chuyến Đi (Trip Detail)**:
   - Quản lý trạng thái thành viên & Yêu cầu tham gia (Join Requests).
   - Cơ chế cập nhật giao diện lập tức (**Optimistic UI Updates**) khi Phê duyệt/Từ chối yêu cầu, tự động rollback (hoàn tác) về trạng thái cũ nếu API trả về lỗi.
   - Xử lý lỗi 404 mượt mà khi chuyến đi không tồn tại, tự động chuyển tiếp tới `NotFoundPage` thiết kế mới.
4. **Hệ Thống Trò Chuyện (Realtime Chat)**:
   - Kết nối WebSocket realtime cực nhanh. Tự động dọn dẹp kết nối, timeout và biến cờ tránh rò rỉ bộ nhớ (memory leaks) khi unmount.
   - Tin nhắn tự động được sắp xếp theo thời gian tăng dần (Chronological Sort) và tự cuộn xuống cuối (Auto-scroll to bottom).
   - Hiển thị tên người gửi (hoặc email dự phòng) linh hoạt thông qua chuỗi fallback.
5. **Thông Báo (Notifications)**:
   - Polling unread notifications kết hợp nút "Xem thêm" (Load more).
   - Cơ chế lọc trùng lặp thông báo bằng cấu trúc dữ liệu `Set` dựa trên ID để đảm bảo không bị lặp item khi hiển thị.
6. **Đánh Giá & Nhận Xét**:
   - Gửi đánh giá cho bạn đồng hành của chuyến đi kèm số sao và mô tả chi tiết.
   - Hỗ trợ xem danh sách các đánh giá. Trạng thái trống được hiển thị chuẩn hóa thành `"Chưa có đánh giá"`.
7. **Tạo Chuyến Đi Mới**:
   - Form nhập liệu thông minh với validation ngày bắt đầu không ở quá khứ và ngày kết thúc phải lớn hơn ngày bắt đầu.
   - Tự động map dữ liệu form `maxMember` sang định dạng payload yêu cầu bởi Backend API (`maxMembers`).

---

## 📂 Cấu Trúc Thư Mục Nguồn (`src/`)

```
src/
├── api/                  # Axios instance và các hàm kết nối API
│   ├── axiosInstance.js  # Cấu hình chung + Interceptors cho JWT token
│   ├── authApi.js
│   ├── chatApi.js
│   ├── joinRequestApi.js
│   ├── notificationApi.js
│   ├── reviewApi.js
│   └── tripApi.js
├── components/           # Các Component dùng chung & theo Module
│   ├── auth/             # Biểu mẫu login, register
│   ├── chat/             # Message bubble, chat input, chat list
│   ├── common/           # Navbar, ProtectedRoute, Skeleton, EmptyState, v.v.
│   ├── notification/     # Notification items
│   ├── review/           # Form đánh giá, ReviewList, ReviewItem
│   └── trip/             # TripCard, TripDetailCard, JoinRequestList/Button
├── context/              # Context API quản lý State toàn cục
│   └── AuthContext.jsx   # Authentication context
├── hooks/                # Custom React Hooks
│   ├── useAuth.js
│   ├── useNotifications.js
│   └── useWebSocket.js   # Custom hook kết nối WebSocket an toàn
├── pages/                # Các trang (views) của ứng dụng
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── TripDetailPage.jsx
│   ├── CreateTripPage.jsx
│   ├── ChatPage.jsx
│   ├── NotificationPage.jsx
│   ├── ProfilePage.jsx
│   └── NotFoundPage.jsx   # Trang báo lỗi 404 sinh động, hiện đại
├── index.css             # CSS toàn cục + Định nghĩa hiệu ứng chuyển trang (page-enter)
└── main.jsx              # Điểm khởi đầu của ứng dụng React
```

---

## 🛠️ Cấu Hình Môi Trường

Tạo tệp `.env` tại thư mục gốc của frontend (`frontend/.env`) với các tham số sau:

```env
# Địa chỉ base URL của API Gateway hoặc Server Backend
VITE_API_URL=http://localhost:3000

# Bật hoặc tắt Mock Service Worker (MSW) cho phát triển offline
VITE_ENABLE_MOCK=false
```

---

## 💻 Hướng Dẫn Phát Triển & Sử Dụng

### 1. Cài đặt các gói phụ thuộc
Di chuyển vào thư mục `frontend` và cài đặt các package cần thiết:
```bash
cd frontend
npm install
```

### 2. Chạy ứng dụng ở chế độ Phát Triển (Development)
Khởi động máy chủ phát triển Vite:
```bash
npm run dev
```
Sau đó truy cập đường dẫn được hiển thị trên console (thường là `http://localhost:5173`).

### 3. Kiểm tra mã nguồn (Linting)
Kiểm tra và sửa các lỗi định dạng code:
```bash
npm run lint
```

### 4. Build ứng dụng cho môi trường Production
Đóng gói tối ưu hóa mã nguồn:
```bash
npm run build
```
Kết quả đóng gói sẽ nằm trong thư mục `/dist`.

### 5. Preview bản Build
Chạy thử bản build production tại máy cục bộ:
```bash
npm run preview
```

---

## 🎨 Trải Nghiệm Giao Diện Premium

- **Theme & Colors**: Tích hợp bảng màu mở rộng trong `tailwind.config.js` với các biến thể màu xanh chủ đạo `primary` thời thượng, kết hợp các màu chỉ báo trực quan `success`, `warning`, `danger` rõ nét.
- **Micro-interactions & Animations**: Áp dụng hiệu ứng động `@keyframes fadeIn` chuyển động nhẹ nhàng khi tải trang (`.page-enter`) giúp tăng sự mượt mà cho trải nghiệm người dùng.
- **Responsive Layout**: Giao diện được tối ưu hiển thị hoàn hảo trên cả thiết bị di động (Mobile) lẫn màn hình máy tính (Desktop).
