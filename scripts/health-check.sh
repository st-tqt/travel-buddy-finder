#!/bin/bash
services=(
  "user-service:8081"
  "trip-service:8082"
  "join-request-service:8083"
  "notification-service:8084"
  "chat-service:8085"
)
echo "🔍 Health Check..."
for s in "${services[@]}"; do
  name="${s%%:*}"
  port="${s##*:}"
  status=$(curl -s -o /dev/null -w "%{http_code}" \
           http://localhost:$port/health 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "  ✅ $name: OK"
  else
    echo "  ❌ $name: DOWN (HTTP $status)"
  fi
done
