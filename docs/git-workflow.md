# Git Workflow – Travel Buddy Finder

> **Quản lý bởi:** TV3 (Leader)

---

## Branch Strategy

```
main                          ← Protected. KHÔNG push thẳng vào đây.
  └── feature/user-service          ← TV1
  └── feature/review-service        ← TV1 (Sprint 3)
  └── feature/trip-service          ← TV2
  └── feature/join-request-service  ← TV2
  └── feature/notification-service  ← TV3 ⭐
  └── feature/chat-service          ← TV3 ⭐
  └── feature/frontend              ← TV4
  └── feature/devops                ← TV5
```

## Quy trình làm việc

```bash
# 1. Tạo branch mới từ main (MỖI sprint)
git checkout main
git pull origin main
git checkout -b feature/<service-name>

# 2. Commit thường xuyên (sau mỗi tính năng nhỏ)
git add .
git commit -m "feat(notification): add RabbitMQ consumer"

# 3. Push lên remote
git push origin feature/<service-name>

# 4. Tạo Pull Request trên GitHub
#    → Dùng PULL_REQUEST_TEMPLATE.md
#    → Cần ít nhất 1 người review approve

# 5. TV3 (leader) merge vào main
```

## Commit Message Convention

```
feat(service):  Thêm tính năng mới
fix(service):   Sửa bug
docs:           Cập nhật tài liệu
refactor:       Refactor code không thay đổi behavior
test:           Thêm test
chore:          Config, build, deps

Ví dụ:
  feat(notification): implement RabbitMQ consumer for join events
  fix(trip): validate tripId before update
  docs: update JWT contract in docs/jwt-contract.md
```

## Quy tắc bắt buộc

| Rule | Lý do |
|------|-------|
| Không push thẳng vào `main` | Bảo vệ code stable |
| PR cần ít nhất 1 review | Phát hiện bug sớm |
| TV3 merge PR cuối cùng | Đảm bảo consistency |
| Không commit `.env` | Bảo mật |
| API phải khớp `docs/api-contract.yaml` | TV4 dùng để mock |

## Conflict Resolution

1. Rebase branch của mình lên `main` mới nhất trước khi tạo PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Nếu conflict → tự resolve rồi ping TV3 kiểm tra lại
