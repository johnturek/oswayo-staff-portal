// Override DATABASE_URL to use coolify-db
require('./database-url-override');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
let prisma;

// Initialize Prisma client
try {
  prisma = new PrismaClient();
  console.log('🗄️ Prisma client initialized');
  console.log('🔗 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
} catch (error) {
  console.error('❌ Prisma client initialization failed:', error.message);
}

// Basic middleware
app.use(cors());

// Custom JSON parser with detailed logging
app.use('/api', (req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('📋 Content-Type:', req.headers['content-type']);
  
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
  });
  
  req.on('end', () => {
    console.log('📄 Raw body length:', rawBody.length);
    console.log('📄 First 100 chars:', rawBody.substring(0, 100));
    
    try {
      if (rawBody && req.headers['content-type']?.includes('application/json')) {
        req.body = JSON.parse(rawBody);
        console.log('✅ Parsed JSON successfully');
      } else {
        req.body = {};
      }
      next();
    } catch (error) {
      console.error('❌ JSON parse error:', error.message);
      res.status(400).json({ 
        error: 'Invalid JSON', 
        received: rawBody.substring(0, 100)
      });
    }
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Debug server with database'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  console.log('🗄️ Database health check requested');
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      test_result: result
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Simple login endpoint for testing
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt with body:', req.body);
  
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password required'
    });
  }
  
  try {
    // Test database connection first
    await prisma.$connect();
    console.log('🗄️ Database connected for login attempt');
    
    // Try to find user (this will fail gracefully if table doesn't exist)
    const user = await prisma.user.findUnique({
      where: { email }
    }).catch(err => {
      console.log('ℹ️ User table might not exist yet:', err.message);
      return null;
    });
    
    console.log('👤 User lookup result:', user ? 'found' : 'not found');
    
    // For testing, accept the admin credentials
    if (email === 'admin@oswayo.com' && password === 'Admin123!') {
      res.json({
        success: true,
        message: 'Login successful (test mode)',
        user: { email, role: 'DISTRICT_ADMIN' },
        token: 'test-token-123'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Catch all for API
app.use('/api/*', (req, res) => {
  console.log(`❓ Unknown API endpoint: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 MINIMAL DEBUG SERVER STARTED');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🗄️ DB Health: http://localhost:${PORT}/api/health/db`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
});
