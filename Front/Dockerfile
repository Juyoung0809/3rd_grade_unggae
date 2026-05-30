FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 빌드 시 환경변수 주입 (docker-compose build args에서 전달)
ARG VITE_API_BASE_URL=""
ARG VITE_TOSS_CLIENT_KEY=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TOSS_CLIENT_KEY=$VITE_TOSS_CLIENT_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
