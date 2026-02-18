# Multi-stage build for production optimization

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY client/ ./
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Stage 3: Production image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tzdata

# Set timezone
ENV TZ=America/New_York

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S oswayo -u 1001

# Set working directory
WORKDIR /app

# Copy backend files
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Copy frontend build
COPY --from=frontend-builder /app/client/dist ./server/public

# Create directories and set permissions
RUN mkdir -p /app/server/uploads /app/server/logs
RUN chown -R oswayo:nodejs /app

# Switch to non-root user
USER oswayo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/server

# Start command
CMD ["npm", "start"]