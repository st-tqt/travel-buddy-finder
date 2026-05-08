FROM node:20-alpine
WORKDIR /app
COPY shared/ /shared/
COPY join-request-service/package*.json ./
RUN npm ci --only=production
COPY join-request-service/src ./src
EXPOSE 8083
CMD ["node", "src/app.js"]
