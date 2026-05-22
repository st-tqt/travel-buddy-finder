# 🎬 Travel Buddy Finder Live Demo Playbook & Checklist

This document acts as the official master plan for conducting a flawless 15-minute live presentation of the **Travel Buddy Finder** platform to reviewers. Follow these chronological steps to guarantee structural stability, eliminate latency lag-time, and showcase the best of TV5's DevOps and testing solutions.

---

## ⏱️ Stage 1: Pre-Demo Preparation (T-minus 10 Mins)

Do not leave anything to chance. Run these validation steps in your command terminal before the presentation begins.

### 🧹 1. Reset System State
Run the system reset script to purge older manual test databases, clear RabbitMQ queues, and start with a clean slate:
```bash
# purges active docker volumes and stops containers
./scripts/reset.sh
```

### 🚀 2. Spin Up System
Start all container services from scratch and build any new local changes:
```bash
./scripts/start.sh
```

### 🟢 3. Health & Readiness Verification
Wait roughly 15 seconds for PostgreSQL schemas and RabbitMQ brokers to fully initialize, then confirm all 9 services are perfectly active:
```bash
# Ensure 100% green output
node scripts/health-check.js
```

### 💾 4. Seed Rich Demo Dataset
Populate database schemas with a realistic, premium dataset (trips to Sapa, Da Nang, Ha Long; active requests; approvals; reviews):
```bash
node scripts/seed-demo-data.js
```
> [!NOTE]
> Seeding the demo data beforehand saves you from manually typing out registration and creation API calls during the short presentation window, allowing you to focus on the dynamic user interactions!

---

## 🎤 Stage 2: Live Demo Walkthrough Sequence (10 Mins)

Perform these steps to demonstrate the core architecture flow:

### 🚶 Step 1: Open the Frontend App
1. Open your web browser and navigate to `http://localhost:80` (or `http://localhost` if port 80 is direct).
2. Point out that the frontend is served via an **Nginx container** built dynamically using Docker.
3. Show the login screen.

### 🔑 Step 2: Show Authentication & Profiles
1. Log in with **Alex Coordinator** (`coordinator@example.com` / `password123`).
2. Show Alex's profile dashboard:
   - Highlight Alex's outstanding average review rating: **4.5 Stars** (computed dynamically from the `review-service` from seeded data: Bella gave 5-star, Charlie gave 4-star).
   - Point out that this profile hydration is done synchronously via HTTP REST calls between the frontend, the **API Gateway**, and the **User Service**.

### 🏔️ Step 3: Explore Active Trips & Advanced Searching
1. Go to the active trips dashboard. You will see three pre-seeded trips:
   - **Sapa Peak Challenge** (Host: Alex, 2 members, Status: `ACTIVE`)
   - **Da Nang Culinary Tour** (Host: Alex, 2 members, Status: `ACTIVE`)
   - **Ha Long Bay Yacht Cruise** (Host: Bella, 2 members, Status: `CLOSED` - since max capacity is 2 and Alex joined!)
2. Demonstrate search and tags filtering:
   - Search for location **"Sapa"** ➡️ returns 1 trip.
   - Filter by tag **"relaxing"** ➡️ returns Da Nang & Ha Long.
   - Explain that search logic is executed through the **Trip Service**'s high-speed query indexing.

### 🤝 Step 4: Live Join Request & Asynchronous Notification Flow
Show the core event-driven architectural flow:
1. Log out from Alex and log in as **Charlie Adventurer** (`traveler2@example.com` / `password123`).
2. Navigate to **Sapa Peak Challenge** (Current members: 2/4).
3. Click "Request to Join" and submit the message: *"Can I bring my camera?"*
4. Log out and log back in as **Alex Coordinator** (`coordinator@example.com`).
5. Open the "Incoming Join Requests" panel. You will see Charlie's pending request.
6. Click **Approve**.
7. Log out and log back in as **Charlie Adventurer** (`traveler2@example.com`).
8. Notice the instant **Notification Alert** icon on Charlie's navbar!
9. Open notifications to see: *"Yêu cầu tham gia Sapa Peak Challenge đã được duyệt"*.
10. **DevOps Explanation for Reviewers**: 
    > [!TIP]
    > *"This notification is not synchronous. When Alex clicked 'Approve', the `join-request-service` published an AMQP event to RabbitMQ. The `notification-service` consumed it asynchronously, saved it, and made it available here. Even if the notification container had been offline, the message would remain safe in RabbitMQ's persistent queue, illustrating the system's fault-tolerant design."*

### 💬 Step 5: Real-Time Chat Room
1. While logged in as Charlie, open the **Sapa Peak Challenge** Chat Room.
2. Type a message: *"Hi guys! Glad to join."*
3. In a second browser tab (or incognito window), open `http://localhost` and log in as **Bella Explorer** (`traveler1@example.com`).
4. Go to the Sapa Chat Room.
5. Notice that Charlie's message appears instantly without refreshing!
6. Type a reply from Bella: *"Welcome Charlie! Can't wait to see your pictures!"*
7. Go back to Charlie's tab and show the instant reply.
8. **DevOps Explanation**:
    > *"This real-time connection uses HTML5 WebSockets routed through our Express API Gateway to the Chat Service microservice."*

### ⭐ Step 6: Peer Reviews & Self-Review Blocks
1. Open the "Review Travel Buddy" page as Charlie.
2. Select **Bella Explorer** and submit a 5-star review: *"Bella is a fantastic photographer and extremely friendly!"*
3. Attempt to submit a second review for Bella ➡️ Explain how the UI or backend prevents it with a clean `HTTP 409 Conflict` popup.
4. Attempt to write a review for yourself (Charlie) ➡️ Show how the system blocks self-reviews at the database/security level with a clean `HTTP 400 Bad Request` guard.

---

## 🧹 Stage 3: Post-Demo Teardown

After a successful presentation, gracefully clean up your local resources:
```bash
# stop the containers to save local RAM and CPU
./scripts/stop.sh
```
Thank the reviewers and invite questions on the containerized topology, rate-limiter rules, or CI/CD pipelines!
