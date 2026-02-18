#!/bin/bash

# Coolify Deployment Script for Oswayo Valley Staff Portal
# This script automates the deployment process to Coolify

set -e  # Exit on any error

echo "🚀 Starting Oswayo Valley Staff Portal Deployment..."

# Configuration
COOLIFY_URL="http://my.oswayo.com:8000"
API_KEY="4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561"
DOMAIN="staffportal.oswayo.com"
PROJECT_NAME="oswayo-staff-portal"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is required but not installed"
        exit 1
    fi
    
    log_info "Requirements check passed ✅"
}

# Build the application
build_application() {
    log_info "Building application..."
    
    # Install server dependencies
    cd server
    npm install --production
    
    # Generate Prisma client
    npx prisma generate
    
    # Install client dependencies and build
    cd ../client
    npm install
    npm run build
    
    # Move built files to server public directory
    rm -rf ../server/public
    mv dist ../server/public
    
    cd ..
    log_info "Application built successfully ✅"
}

# Create environment configuration
create_env_config() {
    log_info "Creating environment configuration..."
    
    cat > .env.production << EOF
# Database Configuration
DATABASE_URL=postgresql://oswayo_staff:StaffPortal2024SecurePass!@postgres:5432/oswayo_staff_portal

# JWT Secrets (Change these in production!)
JWT_SECRET=oswayo-staff-portal-jwt-secret-2024-very-secure-key-$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=oswayo-staff-portal-refresh-secret-2024-very-secure-key-$(openssl rand -hex 32)
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Configure with your Office 365 settings)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER:-noreply@oswayo.com}
SMTP_PASS=${SMTP_PASS:-your-app-password}
FROM_EMAIL=noreply@staffportal.oswayo.com

# Application Settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://${DOMAIN}

# Security Settings
HELMET_CONTENT_SECURITY_POLICY=false
CORS_ORIGIN=https://${DOMAIN}
EOF
    
    log_info "Environment configuration created ✅"
}

# Create Coolify deployment configuration
create_coolify_config() {
    log_info "Creating Coolify deployment configuration..."
    
    cat > coolify-deploy.json << EOF
{
  "name": "${PROJECT_NAME}",
  "description": "Oswayo Valley Staff Portal - Complete HR Management System",
  "domain": "${DOMAIN}",
  "port": 3000,
  "dockerfile": "Dockerfile",
  "build_command": "npm run build",
  "start_command": "npm start",
  "environment": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "DATABASE_URL",
      "value": "postgresql://oswayo_staff:StaffPortal2024SecurePass!@postgres:5432/oswayo_staff_portal"
    }
  ],
  "volumes": [
    {
      "name": "uploads",
      "mount_path": "/app/server/uploads"
    },
    {
      "name": "logs",
      "mount_path": "/app/server/logs"
    }
  ],
  "health_check": {
    "enabled": true,
    "path": "/health",
    "port": 3000,
    "interval": 30,
    "timeout": 10,
    "retries": 3
  },
  "ssl": {
    "enabled": true,
    "force_https": true
  }
}
EOF
    
    log_info "Coolify configuration created ✅"
}

# Deploy to Coolify
deploy_to_coolify() {
    log_info "Deploying to Coolify at ${COOLIFY_URL}..."
    
    # Create deployment package
    tar -czf deployment.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='client/dist' \
        .
    
    # Deploy using Coolify API
    response=$(curl -s -X POST \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@deployment.tar.gz" \
        -F "config=@coolify-deploy.json" \
        "${COOLIFY_URL}/api/v1/deploy")
    
    if [[ $? -eq 0 ]]; then
        log_info "Deployment package uploaded successfully ✅"
        echo "Response: $response"
    else
        log_error "Failed to upload deployment package"
        exit 1
    fi
    
    # Clean up
    rm -f deployment.tar.gz coolify-deploy.json
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Wait for database to be ready
    sleep 30
    
    # Run migrations and seed data
    cd server
    
    # Check if we can connect to database
    if npx prisma db push --accept-data-loss; then
        log_info "Database schema deployed ✅"
        
        # Seed initial data
        if npm run db:seed; then
            log_info "Initial data seeded ✅"
        else
            log_warn "Database seeding failed, but deployment can continue"
        fi
    else
        log_error "Database setup failed"
        exit 1
    fi
    
    cd ..
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for application to start
    sleep 60
    
    # Check health endpoint
    max_attempts=10
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "https://${DOMAIN}/health" > /dev/null; then
            log_info "Application is healthy ✅"
            break
        else
            if [ $attempt -eq $max_attempts ]; then
                log_error "Health check failed after $max_attempts attempts"
                exit 1
            fi
            sleep 30
            ((attempt++))
        fi
    done
}

# Display post-deployment information
show_deployment_info() {
    log_info "🎉 Deployment completed successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Oswayo Valley Staff Portal - Deployment Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Application URL: https://${DOMAIN}"
    echo "🔧 Coolify Dashboard: ${COOLIFY_URL}"
    echo "📧 Support Email: admin@oswayo.com"
    echo ""
    echo "👥 Default Admin Accounts:"
    echo "   • Admin: admin@oswayo.com / Admin123!"
    echo "   • Principal: principal@oswayo.com / Principal123!"
    echo "   • Manager: math.dept@oswayo.com / Manager123!"
    echo "   • Staff: alice.teacher@oswayo.com / Staff123!"
    echo ""
    echo "🔒 IMPORTANT: Change default passwords after first login!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Visit https://${DOMAIN}"
    echo "   2. Login with admin account"
    echo "   3. Change default passwords"
    echo "   4. Configure SMTP settings"
    echo "   5. Import staff directory"
    echo "   6. Setup school calendar"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main deployment process
main() {
    log_info "🏫 Oswayo Valley Staff Portal Deployment"
    log_info "Target: ${COOLIFY_URL}"
    log_info "Domain: ${DOMAIN}"
    echo ""
    
    check_requirements
    build_application
    create_env_config
    create_coolify_config
    deploy_to_coolify
    setup_database
    verify_deployment
    show_deployment_info
}

# Handle script termination
cleanup() {
    log_warn "Deployment interrupted"
    rm -f deployment.tar.gz coolify-deploy.json
    exit 1
}

trap cleanup INT TERM

# Run main function
main "$@"