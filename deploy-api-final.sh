#!/bin/bash

set -e

echo "🚀 DIRECT DOCKER COMPOSE DEPLOYMENT VIA COOLIFY API"
echo "================================================="

COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"
PROJECT_UUID="w0gwws4ogcww0wggs0s040ok"
ENV_UUID="qgsgocosww4s84k480k0s0gc"

# Encode docker-compose.production.yml in base64 for API transfer
echo "📦 Encoding Docker Compose configuration..."
DOCKER_COMPOSE_B64=$(cat docker-compose.production.yml | base64 -w 0)

echo "🔧 Creating Docker Compose Service via API..."

# Try creating as a service instead of application
SERVICE_RESPONSE=$(curl -s -X POST "$COOLIFY_URL/api/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"oswayo-staff-portal-service\",
    \"description\": \"Complete HR Management System\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"environment_uuid\": \"$ENV_UUID\",
    \"docker_compose\": \"$DOCKER_COMPOSE_B64\",
    \"domains\": \"staffportal.oswayo.com\"
  }")

echo "Service Creation Response: $SERVICE_RESPONSE"

# Alternative: Try to deploy using docker compose raw
echo ""
echo "🔄 Alternative: Raw Docker Compose Deployment..."
RAW_RESPONSE=$(curl -s -X POST "$COOLIFY_URL/api/v1/deploy" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"docker-compose\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"docker_compose_raw\": \"$(cat docker-compose.production.yml | sed 's/"/\\"/g' | tr -d '\n')\",
    \"name\": \"oswayo-staff-portal\",
    \"fqdn\": \"https://staffportal.oswayo.com\"
  }")

echo "Raw Deployment Response: $RAW_RESPONSE"

# Try using the existing application creation method with different parameters
echo ""
echo "🎯 Final attempt: Manual application structure..."
CREATE_RESPONSE=$(curl -s -X POST "$COOLIFY_URL/api/applications" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"oswayo-staff-portal\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"environment_id\": 3,
    \"build_pack\": \"dockercompose\",
    \"fqdn\": \"staffportal.oswayo.com\",
    \"ports_exposes\": \"3000\",
    \"docker_compose_raw\": \"$(cat docker-compose.production.yml | sed 's/"/\\"/g' | tr -d '\n')\"
  }")

echo "Manual Create Response: $CREATE_RESPONSE"

echo ""
echo "📋 If API deployment isn't working, the application is fully built and ready:"
echo "✅ Built application package: oswayo-staff-portal-full.tar.gz"
echo "✅ Docker Compose configuration: docker-compose.production.yml"  
echo "✅ Production Dockerfile: Dockerfile.production"
echo "✅ Environment config: .env.production"
echo ""
echo "🌐 Manual deployment via Coolify UI:"
echo "1. Go to: $COOLIFY_URL"
echo "2. Project: oswayo-staff-portal-full"
echo "3. Add Docker Compose service"
echo "4. Upload tar.gz or paste docker-compose.production.yml content"
echo "5. Set domain: staffportal.oswayo.com"
echo ""
echo "🎯 The complete HR system is ready to deploy!"