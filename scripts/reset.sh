#!/bin/bash

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}WARNING: This will stop all containers and COMPLETELY DELETE all database volumes!${NC}"
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}Tearing down containers and removing volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}✔ Environment has been completely reset!${NC}"
else
    echo -e "${YELLOW}Reset aborted by user.${NC}"
fi
