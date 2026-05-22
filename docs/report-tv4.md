# Báo cáo TV4 – Frontend Developer
## Dự án: Travel Buddy Finder – Nhóm 5

**Thành viên:** TV4 – Frontend Developer  
**Tuần báo cáo:** Tuần 4 (Sprint cuối)  
**Ngày hoàn thành:** 2026-05-22  
**Công nghệ:** React 18 + Vite · Tailwind CSS · Axios · React Router v6 · native WebSocket · react-hot-toast

---

## Tổng quan công việc đã hoàn thành

### Tuần 1–3 (Đã hoàn thành trước)
| Hạng mục | Trạng thái |
|---|---|
| Project setup + cấu trúc thư mục (Vite, Tailwind, ESLint) | ✅ |
| Login / Register pages + validation | ✅ |
| HomePage + TripCard listing | ✅ |
| Axios + AuthContext + ProtectedRoute | ✅ |
| MSW mock → tắt và kết nối API thật | ✅ |
| TripDetailPage + Join Request | ✅ |
| Notification badge + realtime poll | ✅ |
| Chat WebSocket realtime | ✅ |
| ProfilePage + ReviewForm + ReviewList | ✅ |
| Toast (react-hot-toast) + Loading Skeleton + EmptyState | ✅ |
| CreateTripPage | ✅ |

---

## Sprint 4 – Chi tiết công việc

### 1. Bug Fixes & Edge Cases

#### 1.1 AuthContext – Token Expiry & State Persistence
**File:** `src/context/AuthContext.jsx`

- Thêm hàm `isTokenExpired(jwtToken)` parse JWT payload, so sánh `exp * 1000` với `Date.now()`.
- Khi app khởi động (`useEffect`): nếu token hết hạn → xoá `localStorage`, reset state; nếu hợp lệ nhưng không có `user` → parse tạm từ JWT payload.
- `login()` lưu cả `accessToken` và `user` vào `localStorage`.
- `logout()` xoá cả hai key và redirect về `/login`.

```js
const isTokenExpired = (jwtToken) => {
  const payload = JSON.parse(atob(jwtToken.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
};
```

#### 1.2 ProtectedRoute – Redirect Back After Login
**Files:** `src/components/common/ProtectedRoute.jsx`, `src/pages/LoginPage.jsx`

- `ProtectedRoute` truyền `state={{ from: location }}` vào `<Navigate to="/login">`.
- `LoginPage` sau login thành công gọi `navigate(state?.from?.pathname || '/home')`.

#### 1.3 HomePage – Debounce Search + Server-side Pagination
**File:** `src/pages/HomePage.jsx`

- Cài `use-debounce@^10` để debounce search input 500ms trước khi gọi API.
- Gọi `tripApi.getTrips({ location, page, limit: 6 })`.
- Hỗ trợ cả response dạng array (mock) lẫn paginated object `{ data, totalPages, total }`.
- Hiển thị Skeleton cards khi đang tải, `EmptyState` khi không có kết quả.
- Nút Prev/Next phân trang (ẩn nếu chỉ có 1 trang).

#### 1.4 TripDetailPage – 404 Handling + Status/ID Fixes
**File:** `src/pages/TripDetailPage.jsx`

- Catch `error.response?.status === 404` → set `is404 = true` → render `<NotFoundPage />` thay vì crash.
- Normalize `joinStatus` từ API về lowercase (`request.status?.toLowerCase()`) để tương thích case-insensitive.
- Sử dụng `String(user.id) === String(trip.ownerId)` để tránh type mismatch.

#### 1.5 JoinRequestList – Optimistic UI Update + Rollback
**File:** `src/components/trip/JoinRequestList.jsx`

- `handleApprove` và `handleReject` thực hiện **optimistic UI update** ngay trước khi gọi API:
  ```js
  const originalRequests = [...requests];
  setRequests(requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
  try {
    await joinRequestApi.approveRequest(id);
  } catch (error) {
    setRequests(originalRequests); // Rollback on failure
  }
  ```
- Status comparison case-insensitive: `req.status?.toLowerCase() === 'pending'`.

#### 1.6 JoinRequestButton – Case-insensitive Status Switch
**File:** `src/components/trip/JoinRequestButton.jsx`

- Normalize `joinStatus` về lowercase trước khi `switch`:
  ```js
  const statusLower = joinStatus?.toLowerCase();
  switch (statusLower) { ... }
  ```

#### 1.7 useNotifications – No Duplicate on Load More
**File:** `src/hooks/useNotifications.js`

- Khi load thêm trang (page > 1), filter trùng ID bằng `Set`:
  ```js
  setNotifications(prev => {
    const existingIds = new Set(prev.map(n => n.id));
    const newItems = (res.data.data || []).filter(n => !existingIds.has(n.id));
    return [...prev, ...newItems];
  });
  ```
- Fallback `pagination || { page, totalPages: 1 }` tránh crash khi API không trả về pagination.

#### 1.8 useWebSocket – Memory Leak Fix + Reconnect Cleanup
**File:** `src/hooks/useWebSocket.js`

- Thêm `isMountedRef` để guard tất cả setState trong event handlers:
  ```js
  const isMountedRef = useRef(true);
  wsRef.current.onopen = () => {
    if (!isMountedRef.current) return;
    setIsConnected(true);
  };
  ```
- Thêm `reconnectTimerRef` để track và `clearTimeout()` khi component unmount → tránh memory leak.
- `sendMessage()` validate `content.trim()` trước khi gửi.
- Cleanup: `isMountedRef.current = false` + clearTimeout + ws.close().

#### 1.9 ChatPage – Chronological Sort
**File:** `src/pages/ChatPage.jsx`

- Thay `.reverse()` bằng sort chronological thực sự:
  ```js
  const sortedMessages = [...(msgRes.data?.data || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  ```

#### 1.10 MessageItem – Display senderName/senderEmail
**File:** `src/components/chat/MessageItem.jsx`

- Fallback chain: `message.senderName || message.senderEmail || message.userEmail || message.senderId`

#### 1.11 ProfilePage – ID Type-safe Comparison
**File:** `src/pages/ProfilePage.jsx`

- `isMe` check: `String(currentUser.id) === String(profileUser.id)` tránh so sánh number vs string.

#### 1.12 ReviewList – Empty State Message
**File:** `src/components/review/ReviewList.jsx`

- Đổi "Chưa có đánh giá nào" → **"Chưa có đánh giá"**.

#### 1.13 CreateTripPage – Validation + API Payload
**File:** `src/pages/CreateTripPage.jsx`

- Validate `startDate` không ở quá khứ (so với `new Date()` với giờ reset về 00:00:00).
- Validate `endDate > startDate`.
- Map `maxMember` → `maxMembers` (plural) trong payload gửi lên backend:
  ```js
  const payload = { ...formData, maxMembers: Number(formData.maxMember), tags };
  ```

---

### 2. UI/UX Polish

#### 2.1 Tailwind Theme Colors
**File:** `tailwind.config.js`

Mở rộng theme với custom color palette:
- `primary.50` → `primary.900`: Sky blue scale
- `success: '#10b981'` (Emerald 500)
- `warning: '#f59e0b'` (Amber 400)
- `danger: '#ef4444'` (Red 500)

#### 2.2 Skeleton Component
**File:** `src/components/common/Skeleton.jsx`

- Variants: `card`, `text`, `circle`
- `card`: Skeleton có chiều cao cố định, animated pulse
- Được dùng trong `HomePage` để hiển thị placeholder khi đang tải trips.

#### 2.3 EmptyState Component
**File:** `src/components/common/EmptyState.jsx`

- Props: `icon`, `title`, `message`, `action` (label + onClick callback)
- Dùng trong `HomePage` khi không có trip nào phù hợp với tìm kiếm.

#### 2.4 Page Fade-in Transitions
**File:** `src/index.css`

```css
@layer utilities {
  .page-enter {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Class `.page-enter` được áp dụng cho: `HomePage`, `TripDetailPage`, `ChatPage`, `NotificationPage`, `ProfilePage`, `CreateTripPage`, `NotFoundPage`.

#### 2.5 NotFoundPage Redesign
**File:** `src/pages/NotFoundPage.jsx`

- Animated compass emoji (bounce + ping)
- Gradient text "404"
- Vietnamese copy: "Chuyến đi này bị lạc rồi!"
- Nút "Quay lại Trang chủ" và "Quay lại trang trước"

---

### 3. Các vấn đề kỹ thuật phát sinh và giải pháp

| Vấn đề | Nguyên nhân | Giải pháp |
|---|---|---|
| Backend trả uppercase status (`OPEN`, `CLOSED`, `PENDING`) | Backend dùng enum uppercase, frontend dùng lowercase string literals | Thêm `.toLowerCase()` trước mọi so sánh status |
| `maxMember` vs `maxMembers` | Backend dùng `maxMembers` (plural), frontend form dùng `maxMember` | Map trong payload: `maxMembers: Number(formData.maxMember)` |
| Chat history xuất hiện ngược | API trả chronological ascending, frontend `.reverse()` làm ngược lại | Thay bằng `.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))` |
| Memory leak khi disconnect và unmount | `setTimeout(connect, 3000)` giữ closure sau unmount | Dùng `isMountedRef` guard + `clearTimeout(reconnectTimerRef.current)` |
| Notifications duplicate khi load-more | Không dedup khi append | Filter bằng `Set` của IDs đã có |
| Type mismatch ownerId/userId | Backend có thể trả number hoặc string ID | Dùng `String(a) === String(b)` để so sánh |

---

### 4. Cấu trúc thư mục Frontend

```
frontend/src/
├── api/
│   ├── axiosInstance.js      # Base Axios + auth interceptor
│   ├── authApi.js
│   ├── chatApi.js
│   ├── joinRequestApi.js
│   ├── notificationApi.js
│   ├── reviewApi.js
│   └── tripApi.js
├── components/
│   ├── auth/
│   ├── chat/
│   │   ├── MessageItem.jsx   # Single message bubble
│   │   ├── MessageInput.jsx  # Text input + send button
│   │   └── MessageList.jsx   # Message list + auto-scroll
│   ├── common/
│   │   ├── EmptyState.jsx    # [NEW] Empty state UI
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotificationBadge.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Skeleton.jsx      # [NEW] Loading skeleton
│   ├── notification/
│   ├── review/
│   │   ├── ReviewForm.jsx
│   │   ├── ReviewItem.jsx
│   │   └── ReviewList.jsx
│   └── trip/
│       ├── JoinRequestButton.jsx
│       ├── JoinRequestList.jsx
│       ├── TripCard.jsx
│       └── TripDetailCard.jsx
├── context/
│   └── AuthContext.jsx       # JWT expiry check + localStorage persistence
├── hooks/
│   ├── useAuth.js
│   ├── useNotifications.js   # Polling + load-more dedup
│   └── useWebSocket.js       # WS connect/reconnect/cleanup
└── pages/
    ├── ChatPage.jsx
    ├── CreateTripPage.jsx
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── NotFoundPage.jsx       # Redesigned 404
    ├── NotificationPage.jsx
    ├── ProfilePage.jsx
    ├── RegisterPage.jsx
    └── TripDetailPage.jsx
```

---

### 5. Checklist cuối Sprint

| Hạng mục | Trạng thái |
|---|---|
| Auth: JWT expiry, localStorage | ✅ |
| ProtectedRoute: redirect back after login | ✅ |
| HomePage: debounce search, pagination, skeleton | ✅ |
| TripDetailPage: 404 handling, status case-insensitive, ownerId type-safe | ✅ |
| JoinRequestList: optimistic UI + rollback | ✅ |
| JoinRequestButton: case-insensitive status | ✅ |
| useNotifications: no duplicate on load-more | ✅ |
| useWebSocket: memory leak fix, reconnect cleanup | ✅ |
| ChatPage: chronological sort | ✅ |
| MessageItem: senderName display chain | ✅ |
| ProfilePage: isMe type-safe | ✅ |
| ReviewList: empty state text | ✅ |
| CreateTripPage: date validation, maxMembers mapping | ✅ |
| tailwind.config.js: custom color palette | ✅ |
| index.css: page-enter fade animation | ✅ |
| NotFoundPage: redesign | ✅ |
| Skeleton.jsx, EmptyState.jsx components | ✅ |
| npm run build: pass | ✅ |

---

*Báo cáo được viết bởi TV4 – Frontend Developer, Travel Buddy Finder – Nhóm 5.*
