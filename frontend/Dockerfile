# Stage 1: Build React App
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Truyền env lúc build nếu cần (hoặc dùng runtime config)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy build output sang thư mục html của nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Cấu hình fallback cho React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
