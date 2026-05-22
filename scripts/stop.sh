#!/bin/bash

# Color codes
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Stopping all Travel Buddy Finder containers...${NC}"
docker-compose stop

echo -e "${GREEN}✔ Microservices stopped successfully!${NC}"
