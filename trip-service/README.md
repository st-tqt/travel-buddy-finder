# Trip Service (TV2)

**Port:** `8082`  
**Stack:** Node.js + Express.js + Sequelize  
**Database:** PostgreSQL  
**Phụ trách:** TV2

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/trips` | Tạo trip mới | JWT |
| GET | `/trips` | Danh sách trip công khai (filter: location, date, tag) | Public |
| GET | `/trips/:id` | Chi tiết trip | Public |
| PUT | `/trips/:id` | Cập nhật trip | JWT (chỉ owner) |
| DELETE | `/trips/:id` | Xoá trip | JWT (chỉ owner) |

## Khởi chạy local

```bash
cd trip-service
npm install
cp ../.env.example .env   # điền TRIP_DB_*
npm run dev
```
