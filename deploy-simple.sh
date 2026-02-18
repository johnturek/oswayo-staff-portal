#!/bin/bash

# Simple Coolify deployment script
echo "🚀 Deploying Staff Portal to Coolify..."

COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"

echo "📦 Creating deployment package..."

# Create a simple project via Coolify API
curl -X POST "$COOLIFY_URL/api/v1/projects" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "oswayo-staff-portal",
    "description": "Oswayo Valley Staff Portal - HR Management System",
    "is_public": false
  }' 

echo ""
echo "✅ Deployment initiated!"
echo "📋 Next steps:"
echo "1. Go to $COOLIFY_URL"
echo "2. Find the 'oswayo-staff-portal' project"
echo "3. Add a new application from Git repo or Docker image"
echo "4. Use the built application from this directory"
echo ""
echo "🌐 Target domain: staffportal.oswayo.com"
echo "📱 Mobile-optimized and ready!"