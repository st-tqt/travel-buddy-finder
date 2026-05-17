FROM node:20-alpine
WORKDIR /app

# Copy shared middleware (dùng chung với TV2 & TV3)
COPY shared/ /shared/

COPY trip-service/package*.json ./
RUN npm install --omit=dev

COPY trip-service/src ./src
EXPOSE 8082
ENV NODE_PATH=/app/node_modules
CMD ["node", "src/app.js"]
