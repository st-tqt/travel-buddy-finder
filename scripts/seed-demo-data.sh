#!/bin/bash

# Color codes for formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}  Executing Travel Buddy Finder Demo Data Seeder...  ${NC}"
echo -e "${YELLOW}====================================================${NC}"

# Ensure node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed on this host system!${NC}"
    exit 1
fi

# Run the javascript seed tool
node "$(dirname "$0")/seed-demo-data.js"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}====================================================${NC}"
    echo -e "${GREEN}✔ Mock demo data seeded successfully!${NC}"
    echo -e "${GREEN}====================================================${NC}"
else
    echo -e "${RED}✘ Failed to seed demo data. Please make sure the containers are UP and Healthy.${NC}"
    exit 1
fi
