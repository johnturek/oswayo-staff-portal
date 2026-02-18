#!/bin/bash

set -e

echo "🚀 Direct Coolify API Deployment Script"
echo "======================================"

COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"
PROJECT_UUID="w0gwws4ogcww0wggs0s040ok"
ENV_UUID="qgsgocosww4s84k480k0s0gc"

echo "📋 Project UUID: $PROJECT_UUID"
echo "🌍 Environment UUID: $ENV_UUID"

# Try creating application using different API endpoint patterns
echo ""
echo "🔧 Attempting to create application via API..."

# Method 1: Direct application creation
echo "Method 1: Direct application creation"
RESPONSE1=$(curl -s -X POST "$COOLIFY_URL/api/v1/applications" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"project_uuid\": \"$PROJECT_UUID\",
    \"environment_uuid\": \"$ENV_UUID\",
    \"name\": \"oswayo-staff-portal\",
    \"description\": \"Complete HR Management System\",
    \"build_pack\": \"dockercompose\",
    \"fqdn\": \"staffportal.oswayo.com\",
    \"docker_compose_raw\": \"$(cat docker-compose.production.yml | sed 's/"/\\"/g' | tr -d '\n')\",
    \"ports_exposes\": \"3000\"
  }")

echo "Response 1: $RESPONSE1"

# Method 2: Try with different structure
echo ""
echo "Method 2: Alternative structure"
RESPONSE2=$(curl -s -X POST "$COOLIFY_URL/api/v1/projects/$PROJECT_UUID/applications" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"oswayo-staff-portal\",
    \"description\": \"Complete HR Management System\",
    \"type\": \"docker-compose\",
    \"fqdn\": \"staffportal.oswayo.com\"
  }")

echo "Response 2: $RESPONSE2"

# Method 3: Check if we need to upload docker-compose first
echo ""
echo "Method 3: Check available resources"
RESOURCES=$(curl -s -X GET "$COOLIFY_URL/api/v1/projects/$PROJECT_UUID" \
  -H "Authorization: Bearer $API_KEY")

echo "Project Resources: $RESOURCES"

echo ""
echo "📝 Manual deployment may be required. Here's what to do:"
echo "1. Go to $COOLIFY_URL"
echo "2. Navigate to project: oswayo-staff-portal-full"
echo "3. Add new application with these settings:"
echo "   - Type: Docker Compose"
echo "   - Name: oswayo-staff-portal"
echo "   - Domain: staffportal.oswayo.com"
echo "   - Port: 3000"
echo "   - Upload: oswayo-staff-portal-full.tar.gz"
echo ""
echo "🎯 The deployment package is ready and the project exists!"