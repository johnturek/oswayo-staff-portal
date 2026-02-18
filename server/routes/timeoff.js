const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole, requireManager } = require('../middleware/auth');
const moment = require('moment');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Get user's time off requests
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'DENIED']),
  query('type').optional().isIn(['SICK', 'VACATION', 'PERSONAL', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID', 'PROFESSIONAL_DEVELOPMENT'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;

    const where = {
      employeeId: req.user.id,
      ...(status && { status }),
      ...(type && { type })
    };

    const [requests, total] = await Promise.all([
      prisma.timeOffRequest.findMany({
        where,
        include: {
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
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

// Create time off request
router.post('/', [
  body('type').isIn(['SICK', 'VACATION', 'PERSONAL', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID', 'PROFESSIONAL_DEVELOPMENT']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('hours').optional().isFloat({ min: 0.5 }),
  body('reason').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, startDate, endDate, hours, reason } = req.body;

    // Validate date range
    const start = moment(startDate);
    const end = moment(endDate);

    if (end.isBefore(start)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for conflicts with existing approved requests
    const conflictingRequests = await prisma.timeOffRequest.findMany({
      where: {
        employeeId: req.user.id,
        status: 'APPROVED',
        OR: [
          {
            startDate: { lte: end.toDate() },
            endDate: { gte: start.toDate() }
          }
        ]
      }
    });

    if (conflictingRequests.length > 0) {
      return res.status(400).json({ 
        error: 'You already have approved time off during this period',
        conflicts: conflictingRequests 
      });
    }

    // Calculate hours if not provided (assume 8 hours per day)
    let totalHours = hours;
    if (!totalHours) {
      const workDays = calculateWorkDays(start, end);
      totalHours = workDays * 8; // Assuming 8-hour work days
    }

    const request = await prisma.timeOffRequest.create({
      data: {
        employeeId: req.user.id,
        type,
        startDate: start.toDate(),
        endDate: end.toDate(),
        hours: totalHours,
        reason,
        status: 'PENDING'
      }
    });

    // Send notification to manager
    if (req.user.managerId) {
      await prisma.notification.create({
        data: {
          userId: req.user.managerId,
          title: 'Time Off Request',
          message: `${req.user.firstName} ${req.user.lastName} has requested ${type.toLowerCase()} time off from ${start.format('MM/DD/YYYY')} to ${end.format('MM/DD/YYYY')}`,
          type: 'timeoff',
          relatedId: request.id
        }
      });

      // Send email notification
      try {
        const manager = await prisma.user.findUnique({
          where: { id: req.user.managerId }
        });

        if (manager) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: manager.email,
            subject: 'Oswayo Staff Portal - Time Off Request',
            html: `
              <h2>Time Off Request</h2>
              <p><strong>Employee:</strong> ${req.user.firstName} ${req.user.lastName}</p>
              <p><strong>Type:</strong> ${type}</p>
              <p><strong>Dates:</strong> ${start.format('MM/DD/YYYY')} to ${end.format('MM/DD/YYYY')}</p>
              <p><strong>Hours:</strong> ${totalHours}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p><a href="${process.env.FRONTEND_URL}/timeoff/pending" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a></p>
            `
          });
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Create time off request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific time off request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.timeOffRequest.findFirst({
      where: {
        id,
        employeeId: req.user.id
      },
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Time off request not found' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get time off request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel pending request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.timeOffRequest.findFirst({
      where: {
        id,
        employeeId: req.user.id,
        status: 'PENDING'
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Time off request not found or cannot be cancelled' });
    }

    await prisma.timeOffRequest.delete({
      where: { id }
    });

    // Notify manager
    if (req.user.managerId) {
      await prisma.notification.create({
        data: {
          userId: req.user.managerId,
          title: 'Time Off Request Cancelled',
          message: `${req.user.firstName} ${req.user.lastName} has cancelled their time off request for ${moment(request.startDate).format('MM/DD/YYYY')}`,
          type: 'timeoff',
          relatedId: id
        }
      });
    }

    res.json({ success: true, message: 'Time off request cancelled' });
  } catch (error) {
    console.error('Cancel time off request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manager routes - get team time off requests
router.get('/team/pending', requireManager, async (req, res) => {
  try {
    let whereCondition;

    if (req.user.role === 'ADMIN') {
      whereCondition = { status: 'PENDING' };
    } else {
      // Get direct reports
      const directReports = await prisma.user.findMany({
        where: { managerId: req.user.id },
        select: { id: true }
      });

      whereCondition = {
        employeeId: { in: directReports.map(r => r.id) },
        status: 'PENDING'
      };
    }

    const requests = await prisma.timeOffRequest.findMany({
      where: whereCondition,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get team time off requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/deny time off request
router.post('/:id/review', requireManager, [
  body('action').isIn(['APPROVED', 'DENIED']),
  body('comments').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { action, comments } = req.body;

    // Verify access to this request
    let request;
    if (req.user.role === 'ADMIN') {
      request = await prisma.timeOffRequest.findUnique({
        where: { id },
        include: { 
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } else {
      request = await prisma.timeOffRequest.findFirst({
        where: {
          id,
          employee: { managerId: req.user.id }
        },
        include: { 
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    }

    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Time off request not found or already reviewed' });
    }

    const updatedRequest = await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        comments
      }
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        userId: request.employeeId,
        title: `Time Off Request ${action === 'APPROVED' ? 'Approved' : 'Denied'}`,
        message: `Your ${request.type.toLowerCase()} request for ${moment(request.startDate).format('MM/DD/YYYY')} - ${moment(request.endDate).format('MM/DD/YYYY')} has been ${action.toLowerCase()}${comments ? `: ${comments}` : ''}`,
        type: 'timeoff',
        relatedId: id
      }
    });

    // Send email notification to employee
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: request.employee.email,
        subject: `Oswayo Staff Portal - Time Off Request ${action === 'APPROVED' ? 'Approved' : 'Denied'}`,
        html: `
          <h2>Time Off Request ${action === 'APPROVED' ? 'Approved' : 'Denied'}</h2>
          <p>Hello ${request.employee.firstName},</p>
          <p>Your ${request.type.toLowerCase()} request has been <strong>${action.toLowerCase()}</strong>.</p>
          <p><strong>Dates:</strong> ${moment(request.startDate).format('MM/DD/YYYY')} to ${moment(request.endDate).format('MM/DD/YYYY')}</p>
          <p><strong>Hours:</strong> ${request.hours}</p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
          <p>Reviewed by: ${req.user.firstName} ${req.user.lastName}</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Review time off request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team calendar view (upcoming time off)
router.get('/team/calendar', requireManager, [
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601()
], async (req, res) => {
  try {
    const startDate = req.query.start ? moment(req.query.start) : moment().startOf('month');
    const endDate = req.query.end ? moment(req.query.end) : moment().add(3, 'months').endOf('month');

    let whereCondition;

    if (req.user.role === 'ADMIN') {
      whereCondition = {
        status: 'APPROVED',
        startDate: { lte: endDate.toDate() },
        endDate: { gte: startDate.toDate() }
      };
    } else {
      const directReports = await prisma.user.findMany({
        where: { managerId: req.user.id },
        select: { id: true }
      });

      whereCondition = {
        employeeId: { in: directReports.map(r => r.id) },
        status: 'APPROVED',
        startDate: { lte: endDate.toDate() },
        endDate: { gte: startDate.toDate() }
      };
    }

    const timeOffRequests = await prisma.timeOffRequest.findMany({
      where: whereCondition,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    res.json({ timeOffRequests });
  } catch (error) {
    console.error('Get team calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate work days between dates
function calculateWorkDays(startDate, endDate) {
  let count = 0;
  const current = startDate.clone();
  
  while (current.isSameOrBefore(endDate, 'day')) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (current.day() !== 0 && current.day() !== 6) {
      count++;
    }
    current.add(1, 'day');
  }
  
  return count;
}

module.exports = router;