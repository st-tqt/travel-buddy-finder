FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
# Copy API contract for Swagger UI (relative path from build context = repo root)
# If building from repo root: docker build -f api-gateway/Dockerfile .
# docker-compose handles this automatically via build context
EXPOSE 3000
CMD ["npm", "start"]
