# Travel Buddy Finder 🧳

> **Môn học:** Phát triển Phần mềm Hướng Dịch vụ (SOA)  
> **Kiến trúc:** Microservices | **Nhóm:** 5 thành viên

## Mô tả dự án

Ứng dụng kết nối người dùng có cùng lịch trình/sở thích du lịch, hỗ trợ tạo chuyến đi nhóm, chat realtime và thông báo async.

## Cấu trúc Monorepo

```
travel-buddy-finder/
├── .github/workflows/    # CI/CD – TV5
├── user-service/         # Java Spring Boot :8081 – TV1
├── trip-service/         # Node.js Express :8082 – TV2
├── join-request-service/ # Node.js Express :8083 – TV2
├── notification-service/ # Node.js Express :8084 – TV3 ⭐
├── chat-service/         # Node.js Express :8085 – TV3 ⭐
├── review-service/       # Java Spring Boot :8086 – TV1 (Sprint 3)
├── frontend/             # React.js Vite – TV4
├── api-gateway/          # Kong / Spring Cloud Gateway
├── docs/                 # api-contract.yaml, diagrams, report
├── docker-compose.yml
└── .env.example
```

## Khởi chạy nhanh

```bash
# 1. Copy env file
cp .env.example .env
# Điền các giá trị thật vào .env

# 2. Chạy toàn bộ hệ thống
docker-compose up --build

# 3. Truy cập
# API Gateway:   http://localhost:8080
# Frontend:      http://localhost:3000
# RabbitMQ UI:   http://localhost:15672  (guest/guest)
```

## Phân công thành viên

| Thành viên | Vai trò | Service phụ trách |
|---|---|---|
| TV1 | Backend (Java) | User Service + API Gateway + Review Service |
| TV2 | Backend (Node.js) | Trip Service + Join Request Service |
| **TV3** | **Backend Lead** | **Notification Service + Chat Service** |
| TV4 | Frontend | React.js UI |
| TV5 | DevOps | Docker, CI/CD, Testing, Báo cáo |

## Tài liệu

- 📄 [`docs/api-contract.yaml`](docs/api-contract.yaml) – OpenAPI 3.0 spec (⚡ xem trước khi code!)
- 🏗️ [`docs/architecture-diagram.png`](docs/architecture-diagram.png)
- 📊 [`docs/dependency-graph.png`](docs/dependency-graph.png)

## Quy trình Git

```
main  ← protected, chỉ merge qua PR
  └── feature/TV1-user-service
  └── feature/TV2-trip-service
  └── feature/TV3-notification-service
  └── feature/TV3-chat-service
  └── feature/TV4-frontend
  └── feature/TV5-devops
```

> Xem thêm chi tiết tại `travel_buddy_finder_plan.md`
