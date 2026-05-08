# Frontend (TV4)

**Stack:** React.js (Vite) + Axios  
**Phụ trách:** TV4

## Sprint 1 – Mock API

Sprint 1 dùng `msw` hoặc `json-server` để mock API theo `docs/api-contract.yaml`.  
**Không chờ backend** – code UI song song!

```bash
# Cài msw
npm install msw --save-dev
npx msw init public/ --save

# Hoặc json-server
npm install json-server --save-dev
npx json-server --watch mocks/db.json --port 3001
```

## Khởi chạy local

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

## Cấu trúc thư mục (dự kiến)

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx         # Feed trips công khai
│   │   ├── TripDetail.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   └── api.js           # Axios client, base URL = API Gateway
│   └── App.jsx
├── mocks/
│   ├── db.json              # json-server mock data
│   └── handlers.js          # msw handlers (dựa trên api-contract.yaml)
├── public/
└── package.json
```
