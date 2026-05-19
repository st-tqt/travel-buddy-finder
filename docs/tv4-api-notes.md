# TV4 API Notes – Travel Buddy Finder
**Dành cho Frontend Developer (TV4)**
**Cập nhật: Tuần 3 – TV2**

---

## 1. Pagination Format

Tất cả endpoint có danh sách trả về theo pagination format thống nhất:

```json
{
  "data": [ ...array of items... ],
  "pagination": {
    "total":      25,
    "page":       1,
    "limit":      10,
    "totalPages": 3
  }
}
```

**Endpoint áp dụng:**
- `GET /trips` (qua gateway: `GET http://localhost:3000/trips`)
- `GET /trips/my`
- `GET /join-requests/my`

**Cách dùng trong React:**
```javascript
const { data: trips, pagination } = await api.get('/trips?page=1&limit=10');
// Render page buttons: Array.from({ length: pagination.totalPages })
```

**Query params cho pagination:**
| Param | Default | Max | Mô tả |
|-------|---------|-----|-------|
| `page` | `1` | – | Trang hiện tại |
| `limit` | `10` | `50` | Số item mỗi trang |

---

## 2. Error Format Thống nhất

Mọi lỗi đều trả về:

```json
{
  "error": "Mô tả lỗi rõ ràng bằng tiếng Anh"
}
```

**Ví dụ:**
```json
{ "error": "Cannot join your own trip" }
{ "error": "Trip is no longer accepting members" }
{ "error": "You already have a pending request for this trip" }
```

> TV4 hiển thị trực tiếp `response.data.error` trong toast/alert.

---

## 3. Trip Status Flow & Badge Màu

```
open  ──(đủ member hoặc owner đóng)──► closed
open  ──(trip kết thúc)──────────────► completed
```

| Status | Màu badge gợi ý | Ý nghĩa |
|--------|-----------------|---------|
| `open` | 🟢 Xanh lá | Đang nhận thành viên |
| `closed` | 🔴 Đỏ | Đủ member, không nhận thêm |
| `completed` | ⚫ Xám | Trip đã kết thúc |

**Filter theo status:** `GET /trips?status=open`

---

## 4. Danh sách Error Codes TV4 phải handle

| HTTP Status | Tình huống | Action gợi ý |
|-------------|-----------|--------------|
| `400` | Validation lỗi (ngày sai, field trống) | Hiển thị error message dưới form field |
| `400` | Cannot join own trip | Toast: "Bạn không thể tham gia trip của chính mình" |
| `400` | Trip is no longer accepting members | Toast: "Trip này không còn nhận thêm thành viên" |
| `400` | Trip is already full | Toast: "Trip đã đủ thành viên" |
| `401` | Không có / sai JWT token | Redirect về trang Login |
| `403` | Forbidden (không phải owner) | Toast: "Bạn không có quyền thực hiện thao tác này" |
| `404` | Trip / Request không tồn tại | Hiển thị trang 404 hoặc redirect về danh sách |
| `409` | Duplicate join request | Toast: "Bạn đã gửi request cho trip này rồi" |
| `500` | Server error | Toast: "Lỗi hệ thống, vui lòng thử lại sau" |

---

## 5. Danh sách Endpoint mới (Tuần 3)

### GET /trips/my
> Lấy danh sách trip do user đang login tạo ra

**Auth required:** ✅ (Bearer JWT)

**Query params:**
- `status` (optional): `open` | `closed` | `completed`

**Response:**
```json
{
  "data": [ ...TripDTO... ],
  "total": 5
}
```

---

### GET /trips với filter đầy đủ

```
GET /trips?location=hanoi&startDate=2026-06-01&endDate=2026-12-31
         &tags=hiking,beach&status=open&page=1&limit=10
```

**Response:** Pagination format (xem mục 1)

---

### GET /join-requests/my
> Lấy tất cả join request của user đang login

**Auth required:** ✅ (Bearer JWT)

**Query params:**
- `status` (optional): `pending` | `approved` | `rejected`

**Response:**
```json
{
  "data": [ ...JoinRequestDTO... ],
  "total": 3
}
```

---

### DELETE /join-requests/:id
> Hủy join request (chỉ người gửi, chỉ khi status=PENDING)

**Auth required:** ✅ (Bearer JWT)

**Success response:**
```json
{ "message": "Request cancelled" }
```

**Lỗi:**
```json
{ "error": "Cannot cancel a request that has already been processed" }   // 400
{ "error": "Forbidden: not the request sender" }                         // 403
```

---

## 6. TripDTO Schema đầy đủ

```json
{
  "id":            "uuid",
  "ownerId":       "uuid (userId của người tạo)",
  "title":         "string",
  "description":   "string | null",
  "location":      "string",
  "startDate":     "YYYY-MM-DD",
  "endDate":       "YYYY-MM-DD",
  "maxMembers":    10,
  "currentMember": 1,
  "tags":          ["hiking", "beach"],
  "status":        "open | closed | completed",
  "coverImage":    "URL string | null",
  "createdAt":     "ISO 8601 datetime",
  "updatedAt":     "ISO 8601 datetime"
}
```

---

## 7. Authentication

Mọi request cần JWT phải có header:
```
Authorization: Bearer <token>
```

Token lấy từ `POST /auth/login` response:
```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

Lưu vào `localStorage.setItem('token', data.token)`.

---

*Câu hỏi liên hệ TV2 qua nhóm chat hoặc comment trên PR.*
