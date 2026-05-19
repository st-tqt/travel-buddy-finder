FROM node:20-alpine
WORKDIR /app
COPY shared/ /shared/
COPY join-request-service/package*.json ./
RUN npm install --omit=dev
COPY join-request-service/src ./src
EXPOSE 8083
ENV NODE_PATH=/app/node_modules
CMD ["node", "src/app.js"]
