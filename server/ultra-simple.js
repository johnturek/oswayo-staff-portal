const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ultra simple server' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@oswayo.com' && password === 'Admin123!') {
    res.json({
      success: true,
      message: 'Login successful',
      user: { email: 'admin@oswayo.com', role: 'DISTRICT_ADMIN' },
      token: 'test-token-123'
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('*', (req, res) => {
  res.send('<h1>Oswayo Staff Portal</h1><p>Login at /api/auth/login</p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ultra simple server on port ${PORT}`);
});
