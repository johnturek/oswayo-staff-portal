FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

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

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start simple working server
CMD ["node", "simple-working.js"]
