const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require DISTRICT_ADMIN role
router.use(authenticateToken);
router.use(requireRole(['DISTRICT_ADMIN']));

// Get all users with relationships
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['STAFF', 'MANAGER', 'FULL_TIME_FACULTY', 'PRINCIPAL', 'DISTRICT_ADMIN']),
  query('building').optional().isString(),
  query('department').optional().isString(),
  query('active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.building) where.building = req.query.building;
    if (req.query.department) where.department = req.query.department;
    if (req.query.active !== undefined) where.active = req.query.active === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          managers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              building: true
            }
          },
          principal: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              building: true
            }
          },
          managedUsers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          faculty: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Remove password from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      users: sanitizedUsers,
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

// Get managers and principals for dropdowns
router.get('/managers', async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'MANAGER' },
          { role: 'PRINCIPAL' },
          { role: 'DISTRICT_ADMIN' }
        ],
        active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        building: true
      },
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' }
      ]
    });

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/users', [
  body('employeeId').notEmpty().isLength({ min: 1, max: 20 }),
  body('email').isEmail(),
  body('firstName').notEmpty().isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().isLength({ min: 1, max: 50 }),
  body('role').isIn(['STAFF', 'MANAGER', 'FULL_TIME_FACULTY', 'PRINCIPAL', 'DISTRICT_ADMIN']),
  body('phoneNumber').optional().isLength({ max: 20 }),
  body('department').optional().isLength({ max: 50 }),
  body('building').optional().isLength({ max: 50 }),
  body('hireDate').optional().isISO8601(),
  body('emergencyContact').optional().isLength({ max: 100 }),
  body('emergencyPhone').optional().isLength({ max: 20 }),
  body('principalId').optional().isUUID(),
  body('managerIds').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employeeId,
      email,
      firstName,
      lastName,
      role,
      phoneNumber,
      department,
      building,
      hireDate,
      emergencyContact,
      emergencyPhone,
      principalId,
      managerIds,
      active = true
    } = req.body;

    // Check if employee ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.employeeId === employeeId ? 
          'Employee ID already exists' : 'Email already exists' 
      });
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Prepare user data
    const userData = {
      employeeId,
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      phoneNumber,
      department,
      building,
      hireDate: hireDate ? new Date(hireDate) : null,
      emergencyContact,
      emergencyPhone,
      active,
      principalId: role === 'FULL_TIME_FACULTY' ? principalId : null
    };

    // Create user
    const user = await prisma.user.create({
      data: userData,
      include: {
        managers: true,
        principal: true
      }
    });

    // Connect managers if specified
    if (role === 'STAFF' && managerIds && managerIds.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          managers: {
            connect: managerIds.map(id => ({ id }))
          }
        }
      });
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', [
  body('employeeId').optional().isLength({ min: 1, max: 20 }),
  body('email').optional().isEmail(),
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('role').optional().isIn(['STAFF', 'MANAGER', 'FULL_TIME_FACULTY', 'PRINCIPAL', 'DISTRICT_ADMIN']),
  body('phoneNumber').optional().isLength({ max: 20 }),
  body('department').optional().isLength({ max: 50 }),
  body('building').optional().isLength({ max: 50 }),
  body('hireDate').optional().isISO8601(),
  body('emergencyContact').optional().isLength({ max: 100 }),
  body('emergencyPhone').optional().isLength({ max: 20 }),
  body('principalId').optional().isUUID(),
  body('managerIds').optional().isArray(),
  body('active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove manager/principal IDs from main update data
    const { managerIds, principalId, ...userData } = updateData;

    // Convert hireDate if provided
    if (userData.hireDate) {
      userData.hireDate = new Date(userData.hireDate);
    }

    // Check if employee ID or email conflicts (if being updated)
    if (userData.employeeId || userData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                userData.employeeId ? { employeeId: userData.employeeId } : {},
                userData.email ? { email: userData.email } : {}
              ].filter(obj => Object.keys(obj).length > 0)
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: existingUser.employeeId === userData.employeeId ? 
            'Employee ID already exists' : 'Email already exists' 
        });
      }
    }

    // Update user basic data
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        principalId: userData.role === 'FULL_TIME_FACULTY' ? principalId : null
      }
    });

    // Update manager relationships for staff
    if (userData.role === 'STAFF' && managerIds !== undefined) {
      // Disconnect all current managers
      await prisma.user.update({
        where: { id },
        data: {
          managers: {
            set: []
          }
        }
      });

      // Connect new managers
      if (managerIds.length > 0) {
        await prisma.user.update({
          where: { id },
          data: {
            managers: {
              connect: managerIds.map(managerId => ({ id: managerId }))
            }
          }
        });
      }
    }

    // Get updated user with relationships
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        managers: true,
        principal: true
      }
    });

    // Remove password from response
    const { password, ...userResponse } = user;

    res.json({ 
      message: 'User updated successfully',
      user: userResponse 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;

    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    await prisma.user.update({
      where: { id },
      data: { 
        password: hashedPassword
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: id,
        title: 'Password Reset',
        message: 'Your password has been reset by an administrator. Please change it on your next login.',
        type: 'system'
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user time cards (for admin oversight)
router.get('/users/:id/timecards', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])
], async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { employeeId: id };
    if (req.query.status) where.status = req.query.status;

    const [timeCards, total] = await Promise.all([
      prisma.timeCard.findMany({
        where,
        include: {
          timeEntries: {
            orderBy: { date: 'asc' }
          },
          approver: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { periodStart: 'desc' },
        skip,
        take: limit
      }),
      prisma.timeCard.count({ where })
    ]);

    res.json({
      timeCards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user time cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete time card (admin only)
router.delete('/timecards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete time entries first
    await prisma.timeEntry.deleteMany({
      where: { timeCardId: id }
    });

    // Delete time card
    await prisma.timeCard.delete({
      where: { id }
    });

    res.json({ message: 'Time card deleted successfully' });
  } catch (error) {
    console.error('Delete time card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all time off requests for admin oversight
router.get('/timeoff-requests', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']),
  query('building').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.building) {
      where.employee = { building: req.query.building };
    }
    if (req.query.startDate && req.query.endDate) {
      where.AND = [
        { startDate: { gte: new Date(req.query.startDate) } },
        { endDate: { lte: new Date(req.query.endDate) } }
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.timeOffRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
              role: true,
              department: true,
              building: true
            }
          },
          approver: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.timeOffRequest.count({ where })
    ]);

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get time off requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Override time off approval (admin emergency approval)
router.post('/timeoff-requests/:id/override-approval', [
  body('action').isIn(['APPROVED', 'REJECTED']),
  body('comments').optional().isString()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;

    const request = await prisma.timeOffRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Time off request not found' });
    }

    const updatedRequest = await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: action,
        approvedAt: action === 'APPROVED' ? new Date() : null,
        approvedBy: req.user.id,
        comments: comments || `Admin override: ${action.toLowerCase()}`
      }
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: request.employeeId,
        title: `Time Off ${action === 'APPROVED' ? 'Approved' : 'Rejected'} (Admin Override)`,
        message: `Your time off request for ${moment(request.startDate).format('MM/DD/YYYY')}${request.startDate.getTime() !== request.endDate.getTime() ? ` - ${moment(request.endDate).format('MM/DD/YYYY')}` : ''} has been ${action.toLowerCase()} by district administration.${comments ? ` Note: ${comments}` : ''}`,
        type: 'timeoff',
        relatedId: id
      }
    });

    res.json({ 
      message: 'Time off request updated successfully',
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Override time off approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system statistics for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingTimeCards,
      pendingTimeOff,
      totalTimeCards,
      totalTimeOffRequests
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.timeCard.count({ where: { status: 'SUBMITTED' } }),
      prisma.timeOffRequest.count({ where: { status: 'PENDING' } }),
      prisma.timeCard.count(),
      prisma.timeOffRequest.count()
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      where: { active: true }
    });

    const usersByBuilding = await prisma.user.groupBy({
      by: ['building'],
      _count: { building: true },
      where: { 
        active: true,
        building: { not: null }
      }
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        pendingTimeCards,
        pendingTimeOff,
        totalTimeCards,
        totalTimeOffRequests
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role
      })),
      usersByBuilding: usersByBuilding.map(item => ({
        building: item.building,
        count: item._count.building
      }))
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
