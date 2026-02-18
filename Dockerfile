FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl openssl openssl-dev postgresql-client

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the client (frontend)
WORKDIR /app/client
RUN npm run build

# Move built frontend to server's public directory
RUN mkdir -p /app/server/public
RUN cp -r dist/* /app/server/public/

# Switch to server directory
WORKDIR /app/server

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "index.js"]
