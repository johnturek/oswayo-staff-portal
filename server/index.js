const express = require('express');
const cors = require('cors');
const path = require('path');
const { staffDirectory, mockTimeCards, mockTimeOffRequests } = require('./admin-data');

const app = express();

// Session storage for token invalidation
const activeSessions = new Set();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (Vue.js build)
app.use(express.static('public'));

// Auth helper
function getAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  
  const token = auth.substring(7);
  if (!token.startsWith('oswayo_token_') || !activeSessions.has(token)) return null;
  
  // Extract user info from token
  const role = token.includes('district_admin') ? 'DISTRICT_ADMIN' : 
                token.includes('principal') ? 'PRINCIPAL' : 'FACULTY';
  
  return Object.values(staffDirectory).find(u => u.role === role) || staffDirectory['admin@oswayo.com'];
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Oswayo Staff Portal Server',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Oswayo Staff Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions.size
  });
});

// =================== AUTHENTICATION ===================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  if (password === 'Admin123!' && staffDirectory[email]) {
    const user = staffDirectory[email];
    const token = `oswayo_token_${Date.now()}_${user.role.toLowerCase()}`;
    activeSessions.add(token);
    
    console.log(`✅ Login successful: ${email} (${user.role})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user,
      token: token
    });
  } else {
    console.log(`❌ Login failed: ${email}`);
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    success: true,
    user: user
  });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    activeSessions.delete(token);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// =================== ADMIN USER MANAGEMENT ===================

app.get('/api/admin/users', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  let users = Object.values(staffDirectory);
  
  // If principal, only show users in their building
  if (authUser.role === 'PRINCIPAL') {
    users = users.filter(u => u.building === authUser.building || u.manager === authUser.id);
  }
  
  res.json({
    success: true,
    data: users,
    total: users.length
  });
});

app.get('/api/admin/users/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const user = Object.values(staffDirectory).find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    success: true,
    user: user
  });
});

app.post('/api/admin/users', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'DISTRICT_ADMIN') {
    return res.status(403).json({ error: 'Only district admin can create users' });
  }
  
  const { firstName, lastName, email, role, department, building } = req.body;
  
  if (staffDirectory[email]) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    employeeId: `EMP${String(Object.keys(staffDirectory).length + 1).padStart(3, '0')}`,
    email,
    firstName,
    lastName, 
    role: role || 'STAFF',
    department: department || 'General',
    building: building || 'District Office',
    hireDate: new Date().toISOString().split('T')[0],
    phoneNumber: '814-555-0000',
    manager: authUser.id,
    active: true
  };
  
  staffDirectory[email] = newUser;
  
  res.json({
    success: true,
    message: 'User created successfully',
    user: newUser
  });
});

app.put('/api/admin/users/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const user = Object.values(staffDirectory).find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Update user fields
  const allowedFields = ['firstName', 'lastName', 'department', 'building', 'phoneNumber', 'active'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  
  res.json({
    success: true,
    message: 'User updated successfully',
    user: user
  });
});

app.post('/api/admin/users/:id/reset-password', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const user = Object.values(staffDirectory).find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    success: true,
    message: 'Password reset to Admin123!',
    newPassword: 'Admin123!'
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'DISTRICT_ADMIN') {
    return res.status(403).json({ error: 'Only district admin can delete users' });
  }
  
  const user = Object.values(staffDirectory).find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Don't actually delete, just deactivate
  user.active = false;
  user.deletedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'User deactivated successfully',
    user: user
  });
});

app.get('/api/admin/managers', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const managers = Object.values(staffDirectory).filter(u => 
    ['DISTRICT_ADMIN', 'PRINCIPAL', 'MANAGER'].includes(u.role) && u.active
  );
  
  res.json({
    success: true,
    managers: managers
  });
});

app.get('/api/admin/managers', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Get all users who can be managers (admins, principals, managers)
  const managers = Object.values(staffDirectory).filter(user => 
    ['DISTRICT_ADMIN', 'PRINCIPAL', 'MANAGER'].includes(user.role)
  );
  
  res.json({
    success: true,
    data: { managers: managers }
  });
});

// =================== TIMECARD MANAGEMENT ===================

app.get('/api/admin/timecards', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  let timecards = mockTimeCards;
  
  // Filter by status if requested
  if (req.query.status) {
    timecards = timecards.filter(tc => tc.status === req.query.status);
  }
  
  res.json({
    success: true,
    data: timecards,
    total: timecards.length
  });
});

app.get('/api/admin/timecards/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const timecard = mockTimeCards.find(tc => tc.id === req.params.id);
  if (!timecard) {
    return res.status(404).json({ error: 'Timecard not found' });
  }
  
  res.json({
    success: true,
    data: timecard
  });
});

app.post('/api/admin/timecards/:id/approve', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const timecard = mockTimeCards.find(tc => tc.id === req.params.id);
  if (!timecard) {
    return res.status(404).json({ error: 'Timecard not found' });
  }
  
  timecard.status = 'APPROVED';
  timecard.approvedBy = authUser.id;
  timecard.approvedAt = new Date().toISOString();
  timecard.comments = req.body.comments || '';
  
  res.json({
    success: true,
    message: 'Timecard approved successfully',
    data: timecard
  });
});

app.post('/api/admin/timecards/:id/reject', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const timecard = mockTimeCards.find(tc => tc.id === req.params.id);
  if (!timecard) {
    return res.status(404).json({ error: 'Timecard not found' });
  }
  
  timecard.status = 'REJECTED';
  timecard.approvedBy = authUser.id;
  timecard.approvedAt = new Date().toISOString();
  timecard.comments = req.body.comments || 'Rejected by administrator';
  
  res.json({
    success: true,
    message: 'Timecard rejected',
    data: timecard
  });
});

// =================== TIME OFF MANAGEMENT ===================

app.get('/api/admin/timeoff', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  let requests = mockTimeOffRequests;
  
  // Filter by status if requested
  if (req.query.status) {
    requests = requests.filter(r => r.status === req.query.status);
  }
  
  res.json({
    success: true,
    data: requests,
    total: requests.length
  });
});

app.get('/api/admin/timeoff/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const request = mockTimeOffRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Time off request not found' });
  }
  
  res.json({
    success: true,
    data: request
  });
});

app.post('/api/admin/timeoff/:id/approve', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const request = mockTimeOffRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Time off request not found' });
  }
  
  request.status = 'APPROVED';
  request.approvedBy = authUser.id;
  request.approvedAt = new Date().toISOString();
  request.comments = req.body.comments || '';
  
  res.json({
    success: true,
    message: 'Time off request approved',
    data: request
  });
});

app.post('/api/admin/timeoff/:id/reject', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const request = mockTimeOffRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Time off request not found' });
  }
  
  request.status = 'REJECTED';
  request.approvedBy = authUser.id;
  request.approvedAt = new Date().toISOString();
  request.comments = req.body.comments || 'Rejected by administrator';
  
  res.json({
    success: true,
    message: 'Time off request rejected',
    data: request
  });
});

// =================== ADMIN DASHBOARD & STATS ===================

app.get('/api/admin/stats', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const totalUsers = Object.keys(staffDirectory).length;
  const activeUsers = Object.values(staffDirectory).filter(u => u.active).length;
  const pendingTimeCards = mockTimeCards.filter(tc => tc.status === 'SUBMITTED').length;
  const pendingTimeOff = mockTimeOffRequests.filter(r => r.status === 'PENDING').length;
  
  // Role breakdown
  const roleStats = {};
  Object.values(staffDirectory).forEach(user => {
    roleStats[user.role] = (roleStats[user.role] || 0) + 1;
  });
  
  // Building breakdown  
  const buildingStats = {};
  Object.values(staffDirectory).forEach(user => {
    buildingStats[user.building] = (buildingStats[user.building] || 0) + 1;
  });
  
  res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      pendingTimeCards,
      pendingTimeOff,
      roleBreakdown: roleStats,
      buildingBreakdown: buildingStats,
      recentHires: Object.values(staffDirectory)
        .filter(u => new Date(u.hireDate) > new Date('2022-01-01'))
        .length
    }
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authUser.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json({
    success: true,
    data: {
      pendingApprovals: {
        timecards: mockTimeCards.filter(tc => tc.status === 'SUBMITTED').length,
        timeOff: mockTimeOffRequests.filter(r => r.status === 'PENDING').length
      },
      recentActivity: [
        { type: 'timecard', action: 'submitted', user: 'Mary Davis', timestamp: new Date().toISOString() },
        { type: 'timeoff', action: 'requested', user: 'Robert Wilson', timestamp: new Date().toISOString() }
      ],
      systemAlerts: [
        { type: 'info', message: 'All systems operational', timestamp: new Date().toISOString() }
      ]
    }
  });
});

// =================== REGULAR USER ENDPOINTS ===================

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      pendingTimeCards: 1,
      pendingTimeOff: 0,
      upcomingEvents: 2,
      notifications: 1
    }
  });
});

app.get('/api/timecards', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Return user's own timecards
  const userTimeCards = mockTimeCards.filter(tc => tc.employee.id === authUser.id);
  
  res.json({
    success: true,
    data: userTimeCards,
    message: userTimeCards.length === 0 ? 'No timecards found' : `Found ${userTimeCards.length} timecards`
  });
});

app.get('/api/timeoff', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Return user's own time off requests
  const userTimeOffRequests = mockTimeOffRequests.filter(r => r.employee.id === authUser.id);
  
  res.json({
    success: true,
    data: userTimeOffRequests,
    message: userTimeOffRequests.length === 0 ? 'No time off requests found' : `Found ${userTimeOffRequests.length} requests`
  });
});

app.get('/api/profile', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    success: true,
    profile: authUser
  });
});

app.put('/api/profile', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Update allowed profile fields
  const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'emergencyContact', 'emergencyPhone'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      authUser[field] = req.body[field];
    }
  });
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: authUser
  });
});

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

app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Welcome to Staff Portal',
        message: 'Your account is now active',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
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
  console.log(`👑 Admin Features: User Management, Timecard Approval, Time Off Management`);
  console.log(`👥 Staff Directory: ${Object.keys(staffDirectory).length} users loaded`);
  console.log('✅ Full admin functionality ready');
});
