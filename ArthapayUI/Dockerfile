# Stage 1: Build React app
FROM node:20-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ build-essential \
    && rm -rf /var/lib/apt/lists/*
ENV PYTHON=/usr/bin/python3

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Accept build-time dummy values for local testing
ARG VITE_CLIENT_FAVICON=/favicon.ico
ARG VITE_CLIENT_META_DESCRIPTION="Default description"
ARG VITE_CLIENT_NAME="Default App"

ENV VITE_CLIENT_FAVICON=$VITE_CLIENT_FAVICON
ENV VITE_CLIENT_META_DESCRIPTION=$VITE_CLIENT_META_DESCRIPTION
ENV VITE_CLIENT_NAME=$VITE_CLIENT_NAME

# Increase memory limit for large builds
ENV NODE_OPTIONS="--max-old-space-size=6144"

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx + runtime config
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy build files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY ./entrypoint.sh /entrypoint.sh

# ✅ Fix CRLF and set executable permissions
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

# Expose HTTP port
EXPOSE 80

# Run entrypoint (generates config.js at runtime and starts nginx)
ENTRYPOINT ["/entrypoint.sh"]
