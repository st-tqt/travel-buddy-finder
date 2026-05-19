# Integration Test Results – Travel Buddy Finder
**TV2 | Tuần 3 | Branch: feature/trip-service**

---

## Môi trường test
- API Gateway: `http://localhost:3000`
- Công cụ: Postman / curl
- Ngày: 2026-05-17

---

## FLOW 1 – Trip Lifecycle hoàn chỉnh

| Bước | Request | Expected | Kết quả |
|------|---------|----------|---------|
| 1 | `POST /trips` (JWT User A) `{ title: "Hanoi Adventure", location: "Hanoi", startDate: "2026-07-01", endDate: "2026-07-05", maxMembers: 2 }` | 201, lưu `tripId` | ✅ PASS |
| 2 | `POST /join-requests` (JWT User B) `{ tripId }` | 201, `status: "PENDING"` | ✅ PASS |
| 3 | `POST /join-requests` (JWT User B) `{ tripId }` (gửi lại) | 409 `"You already have a pending request for this trip"` | ✅ PASS |
| 4 | `PUT /join-requests/:id/approve` (JWT User A) | 200, `status: "APPROVED"` | ✅ PASS |
| 5 | `GET /trips/:tripId` | `currentMember: 2`, `status: "closed"` | ✅ PASS |
| 6 | `POST /join-requests` (JWT User C) `{ tripId }` | 400 `"Trip is no longer accepting members"` | ✅ PASS |
| 7 | `GET /notifications/:userBId` (JWT User B) | Có notification `JOIN_APPROVED` | ✅ PASS (phối hợp TV3) |

**Ghi chú Flow 1:**
- Trip với `maxMembers=2`: sau khi approve User B → `currentMember=2 >= maxMembers=2` → status auto-set `"closed"`.
- RabbitMQ event `join.approved` published → Notification service nhận và tạo notification.

---

## FLOW 2 – Hủy Join Request

| Bước | Request | Expected | Kết quả |
|------|---------|----------|---------|
| 1 | `POST /join-requests` (JWT User B, trip mới) | 201 `status: "pending"` | ✅ PASS |
| 2 | `DELETE /join-requests/:id` (JWT User B) | 200 `{ message: "Request cancelled" }` | ✅ PASS |
| 3 | `POST /join-requests` (JWT User B, cùng trip) | 201 (request cũ đã cancelled, cho phép gửi lại) | ✅ PASS |

**Edge cases được test thêm:**
- `DELETE /join-requests/:id` bởi user khác → 403 PASS
- `DELETE /join-requests/:id` khi status=APPROVED → 400 PASS

---

## FLOW 3 – Filter Trip

| Request | Expected | Kết quả |
|---------|----------|---------|
| `GET /trips?location=hanoi&status=open&page=1&limit=3` | Chỉ trả trip ở Hanoi, đang open, tối đa 3 kết quả + pagination | ✅ PASS |
| `GET /trips?tags=hiking,beach` | Chỉ trả trip có tag hiking hoặc beach | ✅ PASS |
| `GET /trips?startDate=2026-06-01&endDate=2026-12-31` | Trip trong khoảng ngày | ✅ PASS |
| `GET /trips?page=2&limit=5` | Trang 2, 5 item mỗi trang | ✅ PASS |

**Pagination format verify:**
```json
{
  "data": [...],
  "pagination": {
    "total": 12,
    "page": 2,
    "limit": 5,
    "totalPages": 3
  }
}
```
✅ PASS

---

## Edge Cases Verify (Nhiệm vụ 2)

| Case | Expected | Kết quả |
|------|----------|---------|
| User A join trip của chính mình | 400 `"Cannot join your own trip"` | ✅ PASS |
| Join trip status=closed | 400 `"Trip is no longer accepting members"` | ✅ PASS |
| Join trip status=completed | 400 `"Trip is no longer accepting members"` | ✅ PASS |
| Gửi 2 request trùng | 409 `"You already have a pending request for this trip"` | ✅ PASS |
| Join trip đã đủ member | 400 `"Trip is already full"` | ✅ PASS |

---

## Health Check

| Service | Endpoint | Status |
|---------|----------|--------|
| trip-service | `GET /health` | ✅ `{ "status": "ok", "service": "trip-service" }` |
| join-request-service | `GET /health` | ✅ `{ "status": "ok", "service": "join-request-service" }` |

---

## Tóm tắt

- **Flow 1**: PASS ✅ – Trip lifecycle đầy đủ, auto-close hoạt động
- **Flow 2**: PASS ✅ – Cancel + re-send hoạt động đúng
- **Flow 3**: PASS ✅ – Filter và pagination đúng format
- **Edge cases**: Tất cả PASS ✅

---
*Tài liệu này chuẩn bị cho TV5 sử dụng khi viết báo cáo tổng kết dự án.*
