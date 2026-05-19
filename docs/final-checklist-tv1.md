# ✅ Final Checklist – TV1 (Tuần 4 – Trước khi nộp)

> Tự kiểm tra toàn bộ trước khi merge vào main.  
> Đánh dấu `[x]` khi hoàn thành.

---

## CODE QUALITY

- [x] Không có TODO comment chưa xử lý
- [x] Không có code bị comment out
- [x] Không có `System.out.println` debug còn sót
- [x] Không có `console.log` nhạy cảm trong Gateway (dùng logger có reqId)
- [x] Tất cả file có đúng encoding UTF-8

---

## SECURITY

- [x] Không hardcode secret trong code (dùng env vars)
- [x] `.env` không bị commit lên repo (kiểm tra `.gitignore`)
- [x] Không có password, token trong log
- [x] Response không lộ stack trace (GlobalExceptionHandler trả message generic)
- [x] `@JsonIgnore` trên password field trong User entity
- [x] BCrypt password hashing
- [x] Rate limiting: Gateway (10/15min auth) + UserService (5/min login, 3/min register)
- [x] Helmet security headers trên Gateway
- [x] Body size limit 10KB trên Gateway
- [x] HTML sanitization trên comment field (Review Service)
- [x] Email normalize (trim + lowercase) trước khi lưu

---

## FUNCTIONALITY

### User Service `:8081`
- [ ] `POST /auth/register` – email trùng → `400 EMAIL_ALREADY_EXISTS`
- [ ] `POST /auth/register` – password < 6 ký tự → `400 VALIDATION_FAILED`
- [ ] `POST /auth/register` – thiếu field → `400` với message rõ ràng
- [ ] `POST /auth/register` – password chỉ toàn space → `400`
- [ ] `POST /auth/login` – sai password → `401 INVALID_CREDENTIALS`
- [ ] `POST /auth/login` – email không tồn tại → `401`
- [ ] `POST /auth/login` – 6+ lần/phút/IP → `429 Too many attempts`
- [ ] `GET /users/:id` – không có token → `401`
- [ ] `GET /users/:id` – token hết hạn → `401`
- [ ] `GET /users/:id` – id không tồn tại → `404`
- [ ] `GET /health` → `200`

### Review Service `:8086`
- [ ] `POST /reviews` – tự review bản thân → `400`
- [ ] `POST /reviews` – review trùng → `409`
- [ ] `POST /reviews` – rating ngoài 1-5 → `400`
- [ ] `POST /reviews` – comment rỗng → `400`
- [ ] `GET /reviews/user/:id` – user không có review → `200 { data: [], total: 0, averageRating: 0 }`
- [ ] `GET /health` → `200`

### API Gateway `:3000`
- [ ] Route không tồn tại → `404 { "error": "Route not found" }`
- [ ] Service downstream down → `503`
- [ ] Request không có token vào protected route → `401`
- [ ] Token hết hạn → `401`
- [ ] Swagger UI `/api-docs` hiển thị đầy đủ
- [ ] `GET /health` → `200`

---

## BUILD & TEST

- [ ] `mvn test` pass – User Service (không có test failure)
- [ ] `mvn test` pass – Review Service (không có test failure)
- [ ] `docker build` thành công – user-service
- [ ] `docker build` thành công – review-service
- [ ] `docker build` thành công – api-gateway
- [ ] `docker-compose up` → tất cả services healthy

---

## DOCUMENTATION

- [x] `user-service/README.md` đầy đủ
- [x] `review-service/README.md` đầy đủ
- [x] `api-gateway/README.md` đầy đủ
- [x] `docs/report-tv1.md` hoàn chỉnh (Nhiệm vụ 2)
- [x] `docs/slides-tv1.md` hoàn chỉnh (Nhiệm vụ 3)
- [ ] Postman collection đã push lên repo

---

## GIT

- [ ] Tất cả commit có message rõ ràng (feat/fix/docs/chore prefix)
- [ ] Không có merge conflict
- [ ] PR từ `feature/final-polish-tv1` → `develop` đã tạo
- [ ] TV3 (leader) đã review và approve PR
- [ ] Sau khi merge: TV3 merge `develop` → `main`
- [ ] Tag final: `git tag v1.0.0-final && git push origin v1.0.0-final`

---

## GIT COMMANDS – Thực hiện sau khi pass tất cả

```bash
# Commit tất cả thay đổi Tuần 4
git add .
git commit -m "feat(tv1): week4 hardening - rate limit, helmet, compression, report, slides"

# Push lên remote
git push origin feature/final-polish-tv1

# Tạo PR trên GitHub: feature/final-polish-tv1 → develop
# (Yêu cầu TV3 review)

# Sau khi merge: tag final
git tag v1.0.0-final
git push origin v1.0.0-final
```
