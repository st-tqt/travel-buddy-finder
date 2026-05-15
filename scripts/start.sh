#!/bin/bash
echo "🚀 Starting Travel Buddy Finder..."
docker-compose up --build -d
echo "✅ All services started!"
echo "📋 Services:"
echo "  Frontend    : http://localhost:5173"
echo "  API Gateway : http://localhost:3000"
echo "  RabbitMQ UI : http://localhost:15672"
echo "  User Service: http://localhost:8081"
echo "  Trip Service: http://localhost:8082"
