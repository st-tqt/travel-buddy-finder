FROM node:20-alpine
WORKDIR /app
COPY shared/ /shared/
COPY chat-service/package*.json ./
RUN npm ci --only=production
COPY chat-service/src ./src
EXPOSE 8085
CMD ["node", "src/app.js"]
