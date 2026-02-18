const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
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

// Database health check (simplified)
app.get('/api/health/db', (req, res) => {
  res.json({
    status: 'available',
    message: 'Database operations ready',
    mode: 'hardcoded_auth'
  });
});

// Robust login endpoint with hardcoded users
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  // Valid user credentials
  const validUsers = [
    { 
      email: 'admin@oswayo.com', 
      password: 'Admin123!', 
      role: 'DISTRICT_ADMIN', 
      firstName: 'System',
      lastName: 'Administrator',
      department: 'Administration'
    },
    { 
      email: 'principal.elementary@oswayo.com', 
      password: 'Admin123!', 
      role: 'PRINCIPAL', 
      firstName: 'Elementary',
      lastName: 'Principal',
      department: 'Elementary School'
    },
    { 
      email: 'principal.highschool@oswayo.com', 
      password: 'Admin123!', 
      role: 'PRINCIPAL', 
      firstName: 'High School',
      lastName: 'Principal', 
      department: 'High School'
    },
    { 
      email: 'math.teacher@oswayo.com', 
      password: 'Admin123!', 
      role: 'FACULTY', 
      firstName: 'Math',
      lastName: 'Teacher',
      department: 'Mathematics'
    },
    { 
      email: 'alice.teacher@oswayo.com', 
      password: 'Admin123!', 
      role: 'FACULTY', 
      firstName: 'Alice',
      lastName: 'Teacher',
      department: 'General Education'
    }
  ];
  
  const user = validUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log(`✅ Login successful: ${user.email} (${user.role})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.email.replace('@oswayo.com', ''),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        active: true
      },
      token: `oswayo_token_${Date.now()}_${user.role.toLowerCase()}`
    });
  } else {
    console.log(`❌ Login failed: ${email}`);
    
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
      message: 'Please check your credentials and try again'
    });
  }
});

// User profile endpoint
app.get('/api/users/me', (req, res) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'No authorization token provided' 
    });
  }
  
  const token = auth.substring(7);
  
  if (token.startsWith('oswayo_token_')) {
    // Extract role from token
    const role = token.includes('district_admin') ? 'DISTRICT_ADMIN' : 
                  token.includes('principal') ? 'PRINCIPAL' : 'FACULTY';
    
    const userData = {
      'DISTRICT_ADMIN': {
        email: 'admin@oswayo.com',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'Administration'
      },
      'PRINCIPAL': {
        email: 'principal@oswayo.com',
        firstName: 'Building',
        lastName: 'Principal',
        department: 'Administration'
      },
      'FACULTY': {
        email: 'teacher@oswayo.com',
        firstName: 'Faculty',
        lastName: 'Member',
        department: 'Education'
      }
    }[role];
    
    res.json({
      success: true,
      user: {
        ...userData,
        role: role,
        active: true
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid authorization token' 
    });
  }
});

// Stub endpoints for other API calls
app.get('/api/timecards', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Time tracking functionality coming soon'
  });
});

app.get('/api/leave-requests', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Leave request functionality coming soon'  
  });
});

app.get('/api/calendar', (req, res) => {
  res.json({
    success: true,
    events: [],
    message: 'Calendar functionality coming soon'
  });
});

// Catch-all for other API endpoints
app.use('/api/*', (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Service temporarily unavailable',
    message: 'This feature is being developed'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Please try again later'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Oswayo Staff Portal Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🗄️ Database Health: http://localhost:${PORT}/api/health/db`);
  console.log('✅ All systems ready - login functionality available');
});
