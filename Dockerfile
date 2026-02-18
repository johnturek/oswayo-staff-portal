FROM node:18-alpine

WORKDIR /app

# Install basic dependencies
RUN apk add --no-cache curl

# Copy package.json and install minimal dependencies
COPY package.json ./
RUN npm install express cors --no-save

# Copy server file
COPY server/ultra-simple.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start ultra-simple server
CMD ["node", "ultra-simple.js"]
