const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', requireRole(['ADMIN']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().isString(),
  query('role').optional().isIn(['STAFF', 'MANAGER', 'ADMIN']),
  query('isActive').optional().isBoolean(),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let where = {};

    if (req.query.department) {
      where.department = { contains: req.query.department, mode: 'insensitive' };
    }

    if (req.query.role) {
      where.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      where.OR = [
        { firstName: { contains: req.query.search, mode: 'insensitive' } },
        { lastName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
        { employeeId: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          role: true,
          department: true,
          position: true,
          hireDate: true,
          isActive: true,
          managerId: true,
          manager: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          lastLogin: true,
          createdAt: true
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user (Admin only)
router.get('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        role: true,
        department: true,
        position: true,
        hireDate: true,
        isActive: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        directReports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        },
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (Admin only)
router.post('/', requireRole(['ADMIN']), [
  body('email').isEmail().normalizeEmail(),
  body('firstName').notEmpty().trim().isLength({ max: 50 }),
  body('lastName').notEmpty().trim().isLength({ max: 50 }),
  body('employeeId').notEmpty().trim().isLength({ max: 20 }),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['STAFF', 'MANAGER', 'ADMIN']),
  body('department').optional().trim().isLength({ max: 100 }),
  body('position').optional().trim().isLength({ max: 100 }),
  body('hireDate').optional().isISO8601(),
  body('managerId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, employeeId, password, role, department, position, hireDate, managerId } = req.body;

    // Check if email or employeeId already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Employee ID already exists' 
      });
    }

    // Verify manager exists if provided
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId }
      });

      if (!manager || !manager.isActive) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        employeeId,
        passwordHash,
        role,
        department,
        position,
        hireDate: hireDate ? new Date(hireDate) : null,
        managerId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        role: true,
        department: true,
        position: true,
        hireDate: true,
        managerId: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', requireRole(['ADMIN']), [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().notEmpty().trim().isLength({ max: 50 }),
  body('lastName').optional().notEmpty().trim().isLength({ max: 50 }),
  body('employeeId').optional().notEmpty().trim().isLength({ max: 20 }),
  body('role').optional().isIn(['STAFF', 'MANAGER', 'ADMIN']),
  body('department').optional().trim().isLength({ max: 100 }),
  body('position').optional().trim().isLength({ max: 100 }),
  body('hireDate').optional().isISO8601(),
  body('managerId').optional().isUUID(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, firstName, lastName, employeeId, role, department, position, hireDate, managerId, isActive } = req.body;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email/employeeId conflicts if being changed
    if (email && email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({ where: { email } });
      if (emailConflict) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (employeeId && employeeId !== existingUser.employeeId) {
      const idConflict = await prisma.user.findUnique({ where: { employeeId } });
      if (idConflict) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
    }

    // Verify manager if being changed
    if (managerId && managerId !== existingUser.managerId) {
      // Prevent circular reporting
      if (managerId === id) {
        return res.status(400).json({ error: 'User cannot be their own manager' });
      }

      const manager = await prisma.user.findUnique({ where: { id: managerId } });
      if (!manager || !manager.isActive) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }

      // Check for circular reporting structure
      const wouldCreateCircle = await checkCircularReporting(managerId, id);
      if (wouldCreateCircle) {
        return res.status(400).json({ error: 'This would create a circular reporting structure' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(employeeId && { employeeId }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(managerId !== undefined && { managerId: managerId || null }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        role: true,
        department: true,
        position: true,
        hireDate: true,
        managerId: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user password (Admin only)
router.post('/:id/reset-password', requireRole(['ADMIN']), [
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { 
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user hierarchy (Admin only)
router.get('/hierarchy/organization', requireRole(['ADMIN']), async (req, res) => {
  try {
    // Get all users with their manager relationships
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        position: true,
        managerId: true,
        directReports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    // Build hierarchy tree
    const hierarchy = buildHierarchy(users);

    res.json({ hierarchy });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get managers list for dropdown
router.get('/managers/list', requireRole(['ADMIN']), async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { role: { in: ['MANAGER', 'ADMIN'] } },
          { directReports: { some: {} } } // Users who have direct reports
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check for circular reporting
async function checkCircularReporting(newManagerId, userId) {
  let currentId = newManagerId;
  
  while (currentId) {
    if (currentId === userId) {
      return true; // Circular reference found
    }
    
    const user = await prisma.user.findUnique({
      where: { id: currentId },
      select: { managerId: true }
    });
    
    currentId = user?.managerId;
  }
  
  return false;
}

// Helper function to build hierarchy tree
function buildHierarchy(users) {
  const userMap = new Map();
  const roots = [];
  
  // Create user map
  users.forEach(user => {
    userMap.set(user.id, { ...user, children: [] });
  });
  
  // Build tree structure
  users.forEach(user => {
    if (user.managerId && userMap.has(user.managerId)) {
      userMap.get(user.managerId).children.push(userMap.get(user.id));
    } else {
      roots.push(userMap.get(user.id));
    }
  });
  
  return roots;
}

module.exports = router;