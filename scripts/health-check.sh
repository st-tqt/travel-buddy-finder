#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}  Checking Travel Buddy Finder Health Status...      ${NC}"
echo -e "${YELLOW}====================================================${NC}"

SERVICES=(
  "api-gateway|http://localhost:3000/health"
  "user-service|http://localhost:8081/health"
  "trip-service|http://localhost:8082/health"
  "join-request-service|http://localhost:8083/health"
  "notification-service|http://localhost:8084/health"
  "chat-service|http://localhost:8085/health"
  "review-service|http://localhost:8086/health"
  "rabbitmq-mgmt|http://localhost:15672"
  "frontend|http://localhost:80"
)

# Optional argument: wait for healthy (e.g. --wait)
WAIT_HEALTHY=false
if [ "$1" == "--wait" ]; then
    WAIT_HEALTHY=true
    echo -e "${YELLOW}Waiting for services to become healthy (max 45 seconds)...${NC}"
fi

check_services() {
    local all_ok=true
    printf "%-25s | %-10s | %-12s | %-30s\n" "Service Name" "Status Code" "Latency" "Health Output"
    printf -- "--------------------------|------------|--------------|--------------------------------\n"

    for service_entry in "${SERVICES[@]}"; do
        IFS='|' read -r name url <<< "$service_entry"
        
        start_time=$(date +%s%N 2>/dev/null || date +%s)
        # Use curl with 2 seconds timeout
        response=$(curl -s -w "\n%{http_code}" --max-time 2 "$url")
        exit_code=$?
        end_time=$(date +%s%N 2>/dev/null || date +%s)
        
        if [ $exit_code -ne 0 ]; then
            printf "%-25s | %-10s | %-12s | %-30s\n" "${name}" "DOWN" "N/A" "${RED}Connection Failed${NC}"
            all_ok=false
            continue
        fi

        # Extract HTTP code and body
        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | head -n -1)
        
        # Calculate latency in ms
        if [ -n "$start_time" ] && [ -n "$end_time" ]; then
            latency=$(( (end_time - start_time) / 1000000 ))
            latency_str="${latency}ms"
        else
            latency_str="unknown"
        fi

        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 302 ] || [ "$http_code" -eq 301 ]; then
            # Clean body output for cleaner log
            body_clean=$(echo "$body" | tr -d '\r' | tr -d '\n' | cut -c1-30)
            printf "%-25s | %-10s | %-12s | %-30s\n" "${name}" "${GREEN}${http_code}${NC}" "${latency_str}" "${GREEN}${body_clean}${NC}"
        else
            printf "%-25s | %-10s | %-12s | %-30s\n" "${name}" "${RED}${http_code}${NC}" "${latency_str}" "${RED}Unhealthy${NC}"
            all_ok=false
        fi
    done

    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

if [ "$WAIT_HEALTHY" = true ]; then
    max_retries=15
    retry_count=0
    until check_services; do
        retry_count=$((retry_count + 1))
        if [ $retry_count -ge $max_retries ]; then
            echo -e "${RED}\n✘ Some services did not become healthy in time.${NC}"
            exit 1
        fi
        echo -e "${YELLOW}\nSome services are not fully UP yet. Retrying in 3 seconds ($retry_count/$max_retries)...${NC}"
        sleep 3
    done
    echo -e "${GREEN}\n✔ All services are verified healthy!${NC}"
else
    check_services
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}\n✔ All services are UP and Healthy!${NC}"
        exit 0
    else
        echo -e "${RED}\n✘ Some services are DOWN or Unhealthy.${NC}"
        exit 1
    fi
fi
