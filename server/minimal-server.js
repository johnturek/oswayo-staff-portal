const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors());

// Custom JSON parser with detailed logging
app.use('/api', (req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
    console.log('📦 Raw chunk received:', chunk.toString());
  });
  
  req.on('end', () => {
    console.log('📄 Complete raw body:', rawBody);
    console.log('📄 Raw body length:', rawBody.length);
    console.log('📄 First 50 chars:', rawBody.substring(0, 50));
    
    try {
      if (rawBody && req.headers['content-type']?.includes('application/json')) {
        req.body = JSON.parse(rawBody);
        console.log('✅ Parsed JSON successfully:', req.body);
      } else {
        req.body = {};
      }
      next();
    } catch (error) {
      console.error('❌ JSON parse error:', error.message);
      console.error('❌ Problematic content:', rawBody);
      res.status(400).json({ 
        error: 'Invalid JSON', 
        received: rawBody.substring(0, 100),
        contentType: req.headers['content-type']
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
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Minimal server running'
  });
});

// Simple login endpoint for testing
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt with body:', req.body);
  
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password required',
      received: req.body
    });
  }
  
  if (email === 'admin@oswayo.com' && password === 'Admin123!') {
    res.json({
      success: true,
      message: 'Login successful',
      user: { email, role: 'DISTRICT_ADMIN' },
      token: 'test-token-123'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
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
  console.log('🚀 MINIMAL SERVER STARTED');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
});
