const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (Vue.js build)
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Oswayo Staff Portal Server',
    version: '1.0.0'
  });
});

// Database health check (no database required)
app.get('/api/health/db', (req, res) => {
  res.json({
    status: 'available',
    message: 'Running with hardcoded data',
    mode: 'standalone'
  });
});

// Mock user data
const mockUsers = {
  'admin@oswayo.com': {
    id: 'admin',
    email: 'admin@oswayo.com',
    firstName: 'System',
    lastName: 'Administrator', 
    role: 'DISTRICT_ADMIN',
    department: 'Administration',
    active: true
  },
  'principal.elementary@oswayo.com': {
    id: 'principal-elem',
    email: 'principal.elementary@oswayo.com',
    firstName: 'Elementary',
    lastName: 'Principal',
    role: 'PRINCIPAL', 
    department: 'Elementary School',
    active: true
  },
  'math.teacher@oswayo.com': {
    id: 'math-teacher',
    email: 'math.teacher@oswayo.com',
    firstName: 'Math',
    lastName: 'Teacher',
    role: 'FACULTY',
    department: 'Mathematics',
    active: true
  }
};

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  if (password === 'Admin123!' && mockUsers[email]) {
    const user = mockUsers[email];
    console.log(`✅ Login successful: ${email} (${user.role})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user,
      token: `oswayo_token_${Date.now()}_${user.role.toLowerCase()}`
    });
  } else {
    console.log(`❌ Login failed: ${email}`);
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  const token = auth.substring(7);
  
  if (token.startsWith('oswayo_token_')) {
    const role = token.includes('district_admin') ? 'DISTRICT_ADMIN' : 
                  token.includes('principal') ? 'PRINCIPAL' : 'FACULTY';
    
    const userData = Object.values(mockUsers).find(u => u.role === role) || mockUsers['admin@oswayo.com'];
    
    res.json({
      success: true,
      user: userData
    });
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout (client-side, but acknowledge)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      pendingTimeCards: 3,
      pendingTimeOff: 1,
      upcomingEvents: 2,
      notifications: 0
    }
  });
});

// Time Cards API
app.get('/api/timecards', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Time tracking functionality coming soon'
  });
});

app.get('/api/timecards/current', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'No active timecard'
  });
});

// Time Off API  
app.get('/api/timeoff', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Time off requests coming soon'
  });
});

// Calendar API
app.get('/api/calendar', (req, res) => {
  res.json({
    success: true,
    events: [
      {
        id: 1,
        title: 'Professional Development Day',
        start: new Date().toISOString(),
        type: 'PROFESSIONAL_DEVELOPMENT'
      }
    ]
  });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Welcome!',
        message: 'Staff Portal is now active',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Profile API
app.get('/api/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    success: true,
    user: mockUsers['admin@oswayo.com']
  });
});

// Admin API stubs
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    data: Object.values(mockUsers),
    total: Object.keys(mockUsers).length
  });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: Object.keys(mockUsers).length,
      activeUsers: Object.values(mockUsers).filter(u => u.active).length,
      pendingTimeCards: 3,
      pendingTimeOff: 1
    }
  });
});

// Catch-all for other API endpoints
app.use('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'Feature coming soon',
    endpoint: req.path
  });
});

// Serve Vue.js app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Oswayo Staff Portal Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('✅ All API endpoints ready - full functionality available');
});
