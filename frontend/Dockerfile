# ==========================================
# DataStraw Frontend Multi-Stage Dockerfile
# Stage 1: Build React/Vite App with Node 20
# Stage 2: Production Nginx Server
# ==========================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy application source
COPY . .

# Optional Build Argument for API base URL
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Compile production bundle
RUN npm run build

# Stage 2: Production Web Server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
