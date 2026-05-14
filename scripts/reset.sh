#!/bin/bash
echo "⚠️  Resetting all data..."
docker-compose down -v
docker system prune -f
echo "✅ Reset complete"
