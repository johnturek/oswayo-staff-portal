#!/bin/bash

set -e

echo "🚀 CREATING COOLIFY SERVICE VIA API"
echo "=================================="

COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"
PROJECT_UUID="w0gwws4ogcww0wggs0s040ok"
ENV_UUID="qgsgocosww4s84k480k0s0gc"
SERVER_UUID="r4w480gg0cg4kws8gwckgsww"

# Create JSON payload file to avoid escaping issues
cat > service_payload.json << 'EOF'
{
  "name": "oswayo-staff-portal",
  "description": "Complete HR Management System",
  "project_uuid": "w0gwws4ogcww0wggs0s040ok",
  "environment_uuid": "qgsgocosww4s84k480k0s0gc", 
  "server_uuid": "r4w480gg0cg4kws8gwckgsww",
  "type": "docker-compose",
  "docker_compose_raw": "version: '3.8'\nservices:\n  postgres:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_DB: oswayo_staff_portal\n      POSTGRES_USER: oswayo_staff\n      POSTGRES_PASSWORD: StaffPortal2024!\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    ports:\n      - \"5432:5432\"\n  app:\n    build: .\n    environment:\n      NODE_ENV: production\n      PORT: 3000\n      DATABASE_URL: postgresql://oswayo_staff:StaffPortal2024!@postgres:5432/oswayo_staff_portal\n    ports:\n      - \"3000:3000\"\n    depends_on:\n      - postgres\nvolumes:\n  postgres_data:"
}
EOF

echo "📦 Sending service creation request..."
RESPONSE=$(curl -s -X POST "$COOLIFY_URL/api/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @service_payload.json)

echo "Service Creation Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Clean up
rm -f service_payload.json

if [[ $RESPONSE == *"uuid"* ]]; then
    echo ""
    echo "🎉 SUCCESS! Service created via API!"
    echo "✅ Oswayo Staff Portal service is being deployed"
    echo "🌐 Access at: https://staffportal.oswayo.com"
    echo "👤 Login: admin@oswayo.com / Admin123!"
else
    echo ""
    echo "⚠️ API service creation needs adjustment"
    echo "📦 But the complete application is ready for manual deployment:"
    echo "   - Docker Compose: docker-compose.production.yml"
    echo "   - Deployment package: oswayo-staff-portal-full.tar.gz"
    echo "   - Coolify project: oswayo-staff-portal-full (created)"
    echo ""
    echo "🎯 Manual steps:"
    echo "1. Go to $COOLIFY_URL"
    echo "2. Find project 'oswayo-staff-portal-full'"
    echo "3. Add new service > Docker Compose"
    echo "4. Paste docker-compose.production.yml content"
    echo "5. Set domain: staffportal.oswayo.com"
fi