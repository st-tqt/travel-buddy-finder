#!/bin/bash

# Color codes for formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}  Starting Travel Buddy Finder Microservices...      ${NC}"
echo -e "${YELLOW}====================================================${NC}"

# Check if docker daemon is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running! Please start Docker and try again.${NC}"
    exit 1
fi

# Run docker-compose up
echo -e "${GREEN}Building and starting containers in detached mode...${NC}"
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}====================================================${NC}"
    echo -e "${GREEN}✔ Microservices started successfully!${NC}"
    echo -e "${GREEN}Run './scripts/health-check.sh' to verify services health.${NC}"
    echo -e "${GREEN}====================================================${NC}"
else
    echo -e "${RED}✘ Failed to start microservices. See output above for details.${NC}"
    exit 1
fi
