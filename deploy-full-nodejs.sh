#!/bin/bash

set -e

echo "🚀 Deploying Full Node.js Oswayo Staff Portal to Coolify..."
echo "==============================================="

COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"
PROJECT_NAME="oswayo-staff-portal-full"

echo "📦 Building application locally first..."

# Build frontend
echo "🎨 Building frontend..."
cd client
npm install --no-audit
npm run build
cd ..

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
npm install --no-audit

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd server
npx prisma generate
cd ..

echo "✅ Local build completed successfully!"

# Create project in Coolify
echo "📋 Creating Coolify project..."
PROJECT_RESPONSE=$(curl -s -X POST "$COOLIFY_URL/api/v1/projects" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PROJECT_NAME\",\"description\":\"Oswayo Valley Staff Portal - Complete HR System with Database\"}")

echo "Project creation response: $PROJECT_RESPONSE"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf oswayo-staff-portal-full.tar.gz \
  --exclude=node_modules \
  --exclude=client/node_modules \
  --exclude=client/dist \
  --exclude=.git \
  --exclude=*.log \
  server/ \
  client/ \
  package.json \
  docker-compose.production.yml \
  Dockerfile.production \
  .env.production \
  README.md

echo "✅ Deployment package created: oswayo-staff-portal-full.tar.gz"

echo ""
echo "🎯 MANUAL COOLIFY DEPLOYMENT STEPS:"
echo "=================================="
echo ""
echo "1. 🌐 Go to: $COOLIFY_URL"
echo "2. 📁 Find project: '$PROJECT_NAME'"
echo "3. ➕ Add new application:"
echo "   - Type: Docker Compose"
echo "   - Upload: oswayo-staff-portal-full.tar.gz"
echo "   - Compose file: docker-compose.production.yml"
echo ""
echo "4. 🔧 Configure application:"
echo "   - Domain: staffportal.oswayo.com"
echo "   - Port: 3000"
echo "   - SSL: Enable (Let's Encrypt)"
echo ""
echo "5. 📊 Database will be automatically created with:"
echo "   - PostgreSQL 15"
echo "   - Database: oswayo_staff_portal"
echo "   - User: oswayo_staff"
echo "   - Password: StaffPortal2024!"
echo ""
echo "6. 🚀 Deploy and access:"
echo "   - URL: https://staffportal.oswayo.com"
echo "   - Login: admin@oswayo.com / Admin123!"
echo ""
echo "📱 Features ready:"
echo "✅ Mobile-optimized iPhone interface"
echo "✅ Staff authentication system"
echo "✅ Dashboard with HR widgets"
echo "✅ PostgreSQL database backend"
echo "✅ JWT authentication"
echo "✅ Progressive Web App capabilities"
echo ""
echo "🏆 Complete HR management system ready for production!"