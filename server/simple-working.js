const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  console.log('Health check OK');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Simple working server'
  });
});

// Simple login without database dependency
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { email, password } = req.body || {};
  
  // Predefined valid credentials
  const validUsers = [
    { email: 'admin@oswayo.com', password: 'Admin123!', role: 'DISTRICT_ADMIN', name: 'System Administrator' },
    { email: 'principal.elementary@oswayo.com', password: 'Admin123!', role: 'PRINCIPAL', name: 'Elementary Principal' },
    { email: 'principal.highschool@oswayo.com', password: 'Admin123!', role: 'PRINCIPAL', name: 'High School Principal' },
    { email: 'math.teacher@oswayo.com', password: 'Admin123!', role: 'FACULTY', name: 'Math Teacher' },
    { email: 'alice.teacher@oswayo.com', password: 'Admin123!', role: 'FACULTY', name: 'Alice Teacher' }
  ];
  
  const user = validUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log('Login successful for:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.email,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token: `token_${Date.now()}_${user.role}`
    });
  } else {
    console.log('Login failed for:', email);
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }
});

// API endpoints for basic functionality
app.get('/api/users/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Extract role from token for demo
  const token = auth.substring(7);
  const role = token.includes('DISTRICT_ADMIN') ? 'DISTRICT_ADMIN' : 'FACULTY';
  
  res.json({
    success: true,
    user: {
      email: role === 'DISTRICT_ADMIN' ? 'admin@oswayo.com' : 'teacher@oswayo.com',
      role: role,
      name: role === 'DISTRICT_ADMIN' ? 'System Administrator' : 'Teacher'
    }
  });
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 SIMPLE WORKING SERVER STARTED');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('✅ NO DATABASE DEPENDENCIES - SHOULD WORK!');
});
