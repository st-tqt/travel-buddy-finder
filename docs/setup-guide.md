# 🚀 Travel Buddy Finder Setup & Troubleshooting Guide

Welcome to the definitive deployment and troubleshooting manual for the **Travel Buddy Finder** platform. This guide outlines setup sequences, container operations, and troubleshooting recipes for developers.

---

## 🛠️ Step-by-Step Installation

### 1. Prerequisites
Ensure you have the following installed on your host system:
* **Docker Desktop** (with Compose v2+)
* **Node.js** (v20+ recommended)
* **Java JDK 17** & **Maven 3.8+** (optional, for native local compiling)
* **Git Bash** or **WSL** (recommended on Windows for shell script executions)

### 2. Initial Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/travel-buddy-finder.git
   cd travel-buddy-finder
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to ensure the JWT secret and database credentials match:
   ```env
   PORT=3000
   JWT_SECRET=supersecretjwtkey1234567890123456
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=travel_buddy_db
   RABBITMQ_DEFAULT_USER=guest
   RABBITMQ_DEFAULT_PASS=guest
   ```

---

## 💻 Running the Application

We have created native Bash operational scripts inside the `scripts` folder for convenient lifecycle management.

| Script Name | Command | Description |
| :--- | :--- | :--- |
| **Start Services** | `./scripts/start.sh` | Builds and runs all containers in detached mode (`-d`). |
| **Stop Services** | `./scripts/stop.sh` | Gracefully shuts down all services. |
| **Reset State** | `./scripts/reset.sh` | Stops services and purges volumes (clearing all DB schemas/RabbitMQ queues). |
| **Stream Logs** | `./scripts/logs.sh` | Connects to container log output streams in real-time. |
| **Health Check** | `./scripts/health-check.sh` | Pings all services, returning HTTP codes and output pings. |

For Windows CMD/PowerShell environments, you can run the cross-platform Node.js tools directly:
```powershell
# Run Health Check
node scripts/health-check.js

# Run E2E Integration Tests
node scripts/integration-test.js
```

---

## 🩺 Troubleshooting Recipes

### 1. ⚠️ Gateway Request Hangs (Express Body Parsing Bug)
* **Symptoms**: POST or PUT requests sent through the API Gateway hang indefinitely, eventually timing out, while GET requests succeed immediately.
* **Root Cause**: The API Gateway previously parsed the HTTP request body globally using `express.json()` or `bodyParser.json()` before passing it to `http-proxy-middleware`. By parsing the stream first, the Gateway consumed the request stream's TCP payload, leaving the downstream microservices waiting forever for a body stream that had already been read and closed.
* **Resolution**: The Gateway must never parse request bodies globally. We removed `express.json()` at the gateway level. Downstream services will parse their own body payloads independently.

### 2. 🔌 Port Conflicts (`Port 3000/8081/5432 is already in use`)
* **Symptoms**: Docker compose up fails with `bind: address already in use` or container crashes instantly.
* **Resolution**:
  - Find the process using the port (e.g., local PostgreSQL running on host port 5432):
    - **Windows (PowerShell)**:
      ```powershell
      Get-NetTCPConnection -LocalPort 5432 | Select-Object -ExpandProperty OwningProcess
      Stop-Process -Id <PID> -Force
      ```
    - **Linux/macOS**:
      ```bash
      sudo lsof -i :5432
      kill -9 <PID>
      ```
  - Alternatively, adjust the mapped ports in `docker-compose.yml` under the `ports` block of the conflicting service.

### 3. 🐢 Database Cold-Start Connection Refusal
* **Symptoms**: Microservices fail to start on `docker compose up` with database connection errors (`DialectConnectionError`, `ConnectionRefused`).
* **Root Cause**: Spring Boot and Node.js containers boot faster than the PostgreSQL engine can initialize schemas, resulting in connection failure.
* **Resolution**: We configured active docker `healthcheck` tags inside `docker-compose.yml` on the `postgres-db` service:
  ```yaml
  postgres-db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  ```
  Downstream services are structured with `depends_on` utilizing `condition: service_healthy`.

### 4. 🦘 RabbitMQ Startup Latency & Socket Outages
* **Symptoms**: Notification or Chat service fails to bind on start, throwing AMQP connection failures.
* **Root Cause**: RabbitMQ broker initialization takes ~10-15 seconds. If a service pings RabbitMQ beforehand, it crashes.
* **Resolution**: We added retry-connection connection loops inside the microservices' AMQP connection initialization blocks (with backoff timeouts), ensuring the services automatically recover once RabbitMQ is online.

### 5. 🔑 JWT Secret Mismatch (`JsonWebTokenError: invalid signature`)
* **Symptoms**: Users can log in successfully but receive `401 Unauthorized` or `403 Forbidden` on subsequent trip or join requests.
* **Root Cause**: The API Gateway and the individual microservices are using different `JWT_SECRET` keys, preventing secondary services from verifying the JWT token signed by the Gateway or User service.
* **Resolution**: Ensure the `.env` file at the root contains a unified `JWT_SECRET` value, and check that all service environments are loading from this root file or passing the exact same value.

### 6. 🌐 CORS Errors (`Access-Control-Allow-Origin blocked`)
* **Symptoms**: Web client console shows CORS blocking headers on API calls.
* **Resolution**:
  - All browser requests MUST hit the **API Gateway** on port 3000, never the microservices directly on their native ports (e.g. 8081).
  - The Gateway has a robust CORS configuration enabling credentials and cross-origin resource sharing:
    ```javascript
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:80',
      credentials: true
    }));
    ```

### 7. 🔌 WebSocket Drops in Chat
* **Symptoms**: Real-time chat messages are dropped, or users disconnect repeatedly.
* **Resolution**:
  - The gateway proxy config for the chat service must explicitly enable websocket upgrades:
    ```javascript
    app.use('/api/chat', createProxyMiddleware({
      target: 'http://chat-service:8085',
      changeOrigin: true,
      ws: true // MUST BE TRUE
    }));
    ```
  - Ensure the client connects to the correct protocol: `ws://localhost:3000/api/chat` (going through the Gateway proxy) instead of `ws://localhost:8085`.
