# Oswayo Valley Staff Portal Deployment Guide

## 🚀 Quick Deploy to Coolify

### Prerequisites
- Coolify instance running at `my.oswayo.com:8000`
- API Key: `4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561`
- Domain `staffportal.oswayo.com` pointed to your Coolify server

### Step 1: Deploy Database

1. **Create PostgreSQL Service in Coolify**
   ```bash
   Service Name: oswayo-staff-db
   Image: postgres:15-alpine
   Environment Variables:
   - POSTGRES_USER=oswayo_staff
   - POSTGRES_PASSWORD=StaffPortal2024SecurePass!
   - POSTGRES_DB=oswayo_staff_portal
   ```

2. **Configure Persistent Volume**
   ```bash
   Volume Name: postgres-data
   Mount Path: /var/lib/postgresql/data
   ```

### Step 2: Deploy Application

1. **Create Application in Coolify**
   ```bash
   Project Name: Oswayo Staff Portal
   Repository: [Upload this project folder]
   Build Command: ./deploy-coolify.sh
   ```

2. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://oswayo_staff:StaffPortal2024SecurePass!@oswayo-staff-db:5432/oswayo_staff_portal
   JWT_SECRET=oswayo-staff-portal-jwt-secret-2024-very-secure-key
   JWT_REFRESH_SECRET=oswayo-staff-portal-refresh-secret-2024-very-secure-key
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your-email@oswayo.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@staffportal.oswayo.com
   FRONTEND_URL=https://staffportal.oswayo.com
   ```

3. **Configure Domain**
   ```bash
   Domain: staffportal.oswayo.com
   SSL: Enable (Let's Encrypt)
   Force HTTPS: Yes
   ```

### Step 3: Initialize Database

The application will automatically:
- Run database migrations
- Seed initial data
- Create admin accounts

### Step 4: Access Application

1. **Visit**: https://staffportal.oswayo.com
2. **Login with Admin Account**:
   - Email: `admin@oswayo.com`
   - Password: `Admin123!`

## 🔧 Manual Deployment

### Local Development

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd oswayo-staff-portal
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Setup Database**
   ```bash
   cd server
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm install
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Production Deployment

1. **Build Production Image**
   ```bash
   docker build -t oswayo-staff-portal .
   ```

2. **Run with Environment Variables**
   ```bash
   docker run -d \
     --name oswayo-staff-portal \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
     -e JWT_SECRET="your-secret-key" \
     oswayo-staff-portal
   ```

## 📧 Email Configuration

### Office 365 Setup
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@oswayo.com
SMTP_PASS=your-app-password
```

### Gmail Setup
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🏫 Initial Setup

### Default Accounts Created
- **Admin**: admin@oswayo.com / Admin123!
- **Principal**: principal@oswayo.com / Principal123!
- **Manager**: math.dept@oswayo.com / Manager123!
- **Staff**: alice.teacher@oswayo.com / Staff123!

### Post-Deployment Tasks

1. **Change Default Passwords**
2. **Configure SMTP Settings**
3. **Import Staff Directory**
4. **Setup School Calendar**
5. **Configure Department Hierarchy**

## 🔒 Security Considerations

### Production Security
- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS only
- Configure firewall rules
- Regular security updates

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=very-secure-random-string
JWT_REFRESH_SECRET=another-secure-random-string

# Email
SMTP_HOST=smtp.office365.com
SMTP_USER=noreply@oswayo.com
SMTP_PASS=secure-app-password

# Optional
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://staffportal.oswayo.com
```

## 📊 Monitoring & Maintenance

### Health Checks
- Application: `GET /health`
- Database: Built-in PostgreSQL health check
- Email: Test notification system

### Backup Strategy
- Database: Daily automated backups
- Uploads: File system backup
- Configuration: Environment variables backup

### Log Files
- Application: `/app/server/logs/`
- Access: Via Coolify dashboard
- Error tracking: Built-in error handling

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database service status
docker-compose ps postgres

# Check environment variables
echo $DATABASE_URL
```

**Email Notifications Not Working**
```bash
# Test SMTP connection
curl -X POST /api/auth/forgot-password -d '{"email":"test@oswayo.com"}'
```

**SSL Certificate Issues**
```bash
# Check domain DNS
nslookup staffportal.oswayo.com

# Verify Coolify SSL settings
```

### Support Contacts
- **System Administrator**: admin@oswayo.com
- **Technical Support**: Contact JTBot AI
- **Documentation**: This README file

## 📱 Mobile Access

The application is fully responsive and optimized for mobile devices:

- **iOS Safari**: Full PWA support
- **Android Chrome**: Native-like experience
- **Touch Optimization**: 44px minimum touch targets
- **Offline Ready**: Basic offline functionality

## 🔄 Updates & Maintenance

### Automatic Updates
- Database migrations run automatically
- No downtime deployments via Coolify
- Rolling updates for zero interruption

### Scheduled Maintenance
- **Daily**: Database backup at 2 AM
- **Weekly**: Log rotation and cleanup
- **Monthly**: Security updates and patches

---

**Deployment Status**: ✅ Ready for Production
**Last Updated**: February 2024
**Version**: 1.0.0