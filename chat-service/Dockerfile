FROM node:20-alpine
WORKDIR /app
COPY shared/ /shared/
COPY chat-service/package*.json ./
RUN npm install --omit=dev
COPY chat-service/src ./src
EXPOSE 8085
ENV NODE_PATH=/app/node_modules
CMD ["node", "src/app.js"]
