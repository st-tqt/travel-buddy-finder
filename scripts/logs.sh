#!/bin/bash

# Streams logs of all microservices
docker-compose logs -f "$@"
