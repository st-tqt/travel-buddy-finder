# Setup Guide – Travel Buddy Finder

## Yêu cầu máy tính
- Docker Desktop >= 4.x
- Node.js 20 LTS
- Git
- RAM tối thiểu: 8GB (chạy toàn bộ hệ thống)

## Chạy lần đầu
1. Clone repo
   ```bash
   git clone https://github.com/st-tqt/travel-buddy-finder.git
   cd travel-buddy-finder
   ```

2. Tạo file môi trường
   ```bash
   cp .env.example .env
   ```

3. Khởi động toàn bộ hệ thống
   ```bash
   chmod +x scripts/*.sh
   ./scripts/start.sh
   ```

4. Kiểm tra hệ thống
   ```bash
   ./scripts/health-check.sh
   ```

## Chạy từng service riêng (khi đang dev)
```bash
cd trip-service
npm install
cp ../.env.example .env   # điền TRIP_DB_* vào .env
node src/app.js
```

## Các địa chỉ quan trọng
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| RabbitMQ UI | http://localhost:15672 |
| User Service | http://localhost:8081 |
| Trip Service | http://localhost:8082 |

## Xử lý lỗi thường gặp
- Port bị chiếm: `lsof -i :<port>` → `kill <PID>`
- DB chưa ready: `docker-compose restart <service-name>`
- Reset sạch   : `./scripts/reset.sh`
