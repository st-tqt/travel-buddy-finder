FROM node:20-alpine
WORKDIR /app

# Copy shared middleware (dùng chung với TV2 & TV3)
COPY shared/ /shared/

COPY trip-service/package*.json ./
RUN npm ci --only=production

COPY trip-service/src ./src
EXPOSE 8082
CMD ["node", "src/app.js"]
