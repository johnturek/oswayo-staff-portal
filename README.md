# 🏫 Oswayo Valley Staff Portal

> **Complete HR Management System for School District Staff**

A modern, mobile-responsive web application designed specifically for Oswayo Valley School District staff to manage time cards, time off requests, and view the school calendar.

[![Deployment Status](https://img.shields.io/badge/deployment-ready-brightgreen)](https://staffportal.oswayo.com)
[![Node.js Version](https://img.shields.io/badge/node.js-18.x-green)](https://nodejs.org)
[![Vue.js Version](https://img.shields.io/badge/vue.js-3.x-green)](https://vuejs.org)
[![Mobile Optimized](https://img.shields.io/badge/mobile-optimized-blue)](https://developers.google.com/web/progressive-web-apps)

## 🌟 Features

### 🔐 **Authentication System**
- Secure staff login with JWT tokens
- Password reset functionality
- Role-based access control (Staff, Manager, Admin)
- Session management with automatic refresh

### ⏰ **Time Card Management**
- Bi-weekly time card submission system
- Real-time time tracking with in/out times
- Multiple day types (regular, sick, vacation, holiday, etc.)
- Manager approval workflow
- Historical time card viewing
- Mobile-friendly time entry

### 📅 **Master Calendar System**
- School calendar with holiday/event management
- Admin editing capabilities for calendar events
- Integration with time card system
- Retroactive calendar modifications
- School year template generation

### 🏖️ **Time Off Request System**
- Employee time off submission workflow
- Multiple request types (sick, personal, vacation, etc.)
- Manager approval process with email notifications
- Calendar integration and conflict detection
- Team time off calendar view

### 👥 **Management Hierarchy**
- Employee-manager relationship mapping
- Approval routing based on reporting structure
- Admin override capabilities
- Department organization
- Team management tools

### 📱 **Mobile-First Design**
- Responsive design optimized for iPhone and mobile devices
- Touch-friendly interfaces with 44px minimum touch targets
- PWA capabilities for native app-like experience
- Offline functionality for basic operations
- Fast loading and optimized performance

## 🚀 Quick Start

### Option 1: One-Click Coolify Deployment

```bash
# Clone the repository
git clone <repository-url>
cd oswayo-staff-portal

# Run the automated deployment script
./deploy-coolify.sh
```

**Target Deployment:**
- **Coolify Instance:** my.oswayo.com:8000
- **Domain:** staffportal.oswayo.com
- **API Key:** 4|wYrir3xxv4VHhjjKWoy6sE3Xk4V2jOxS3nLsl3CG5d4b2561

### Option 2: Docker Compose (Local Development)

```bash
# Start all services
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Option 3: Manual Development Setup

```bash
# Install backend dependencies
cd server
npm install
npx prisma migrate dev
npx prisma db seed

# Install frontend dependencies  
cd ../client
npm install

# Start development servers
npm run dev  # Frontend (port 5173)
cd ../server && npm run dev  # Backend (port 3000)
```

## 📋 Default Accounts

After deployment, these accounts are automatically created:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@oswayo.com | Admin123! | System administration |
| Principal | principal@oswayo.com | Principal123! | School administration |
| Manager | math.dept@oswayo.com | Manager123! | Department management |
| Staff | alice.teacher@oswayo.com | Staff123! | Regular staff member |

> ⚠️ **Security**: Change all default passwords immediately after deployment!

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens with refresh
- **Email:** Nodemailer with Office 365/SMTP
- **Validation:** express-validator
- **Security:** Helmet, CORS, rate limiting

### Frontend Stack
- **Framework:** Vue.js 3 with Composition API
- **Routing:** Vue Router 4
- **State Management:** Pinia
- **Styling:** Tailwind CSS with mobile-first design
- **HTTP Client:** Axios with interceptors
- **Build Tool:** Vite
- **Icons:** Heroicons

### Database Schema
```sql
Users (Staff, Managers, Admins)
├── TimeCards (Bi-weekly submissions)
│   └── TimeEntries (Daily time tracking)
├── TimeOffRequests (Vacation, sick, etc.)
├── CalendarEvents (School calendar)
└── Notifications (System alerts)
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT Authentication
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email Configuration
SMTP_HOST=smtp.office365.com
SMTP_USER=noreply@oswayo.com
SMTP_PASS=your-app-password

# Application
NODE_ENV=production
FRONTEND_URL=https://staffportal.oswayo.com
```

### SMTP Setup (Office 365)
1. Create app password in Office 365
2. Use `smtp.office365.com` on port 587
3. Enable TLS/STARTTLS

## 📱 Mobile Features

### iOS Safari
- Add to Home Screen support
- Native-like scrolling and animations
- Touch callout optimization
- Safe area handling for notched devices

### Android Chrome
- PWA manifest for native installation
- Theme color customization
- Touch target optimization
- Responsive breakpoints

### Touch Interactions
- Minimum 44px touch targets
- Haptic feedback simulation
- Swipe gestures for navigation
- Pull-to-refresh support

## 🔐 Security Features

### Authentication & Authorization
- JWT tokens with automatic refresh
- Role-based access control
- Session timeout handling
- CSRF protection

### Data Protection
- SQL injection prevention via Prisma
- XSS protection with Helmet
- Rate limiting on all endpoints
- Input validation and sanitization

### Infrastructure
- HTTPS-only in production
- Secure headers configuration
- Database connection encryption
- Environment variable protection

## 📊 System Requirements

### Server Requirements
- **CPU:** 2+ cores recommended
- **RAM:** 4GB minimum, 8GB recommended  
- **Storage:** 20GB for application + database
- **OS:** Linux (Ubuntu 20.04+ recommended)

### Database Requirements
- **PostgreSQL:** 13+ required, 15+ recommended
- **Storage:** 10GB initial, scales with data
- **Connections:** 100 concurrent connections

### Client Requirements
- **Modern browsers:** Chrome 88+, Firefox 85+, Safari 14+
- **Mobile:** iOS 13+, Android 8+
- **JavaScript:** ES2020 support required

## 🚀 Deployment Options

### 1. Coolify (Recommended)
- Automated deployment with the provided script
- SSL certificate management
- Container orchestration
- Zero-downtime updates

### 2. Docker
- Complete containerization
- Multi-stage builds for optimization
- Health checks and restart policies

### 3. Traditional VPS
- PM2 process management
- Nginx reverse proxy
- Let's Encrypt SSL

## 🔍 Monitoring & Logging

### Application Monitoring
- Health check endpoint: `/health`
- Request logging with unique IDs
- Error tracking and alerting
- Performance metrics collection

### Database Monitoring
- Connection pool monitoring
- Query performance tracking
- Backup verification
- Storage usage alerts

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- ESLint configuration included
- Prettier for code formatting
- Vue.js style guide compliance
- JSDoc for API documentation

## 📚 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/login          # Staff login
POST /api/auth/refresh        # Token refresh
POST /api/auth/forgot-password # Password reset
GET  /api/auth/me            # Current user info
```

### Time Card Endpoints
```bash
GET  /api/timecards/current   # Current time card
POST /api/timecards/entries   # Add time entry
PUT  /api/timecards/:id/submit # Submit for approval
GET  /api/timecards/team/pending # Manager view
```

### Time Off Endpoints
```bash
GET  /api/timeoff            # User's requests
POST /api/timeoff            # Create new request
POST /api/timeoff/:id/review # Approve/deny request
GET  /api/timeoff/team/calendar # Team calendar
```

## 📞 Support

### Documentation
- [Deployment Guide](DEPLOYMENT.md)
- [User Manual](docs/USER_MANUAL.md)
- [API Reference](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Contact Information
- **System Administrator:** admin@oswayo.com
- **Technical Support:** JTBot AI
- **Project Repository:** [GitHub Link]

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Oswayo Valley School District for project requirements
- Vue.js and Node.js communities for excellent tools
- Tailwind CSS for the mobile-first design system
- Prisma team for the excellent ORM

---

**Built with ❤️ for Oswayo Valley School District**

*Last Updated: February 2024 | Version 1.0.0*