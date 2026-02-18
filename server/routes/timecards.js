const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole, requireManager } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get current pay period dates
const getCurrentPayPeriod = () => {
  // Assuming bi-weekly pay periods starting on Monday
  const now = moment();
  const startOfWeek = now.clone().startOf('isoWeek'); // Monday
  
  // Find the Monday that starts the current pay period
  let periodStart = startOfWeek.clone();
  while (periodStart.week() % 2 !== 1) {
    periodStart.subtract(1, 'week');
  }
  
  const periodEnd = periodStart.clone().add(13, 'days').endOf('day');
  
  return {
    start: periodStart.toDate(),
    end: periodEnd.toDate()
  };
};

// Get user's time cards
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])
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

    const where = {
      employeeId: req.user.id,
      ...(status && { status })
    };

    const [timeCards, total] = await Promise.all([
      prisma.timeCard.findMany({
        where,
        include: {
          timeEntries: {
            orderBy: { date: 'asc' }
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
    console.error('Get time cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current time card (or create if doesn't exist)
router.get('/current', async (req, res) => {
  try {
    const currentPeriod = getCurrentPayPeriod();
    
    let timeCard = await prisma.timeCard.findFirst({
      where: {
        employeeId: req.user.id,
        periodStart: {
          gte: currentPeriod.start,
          lte: currentPeriod.end
        }
      },
      include: {
        timeEntries: {
          orderBy: { date: 'asc' }
        }
      }
    });

    // Create time card if it doesn't exist
    if (!timeCard) {
      timeCard = await prisma.timeCard.create({
        data: {
          employeeId: req.user.id,
          periodStart: currentPeriod.start,
          periodEnd: currentPeriod.end,
          status: 'DRAFT'
        },
        include: {
          timeEntries: true
        }
      });
    }

    res.json({ timeCard });
  } catch (error) {
    console.error('Get current time card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific time card
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const timeCard = await prisma.timeCard.findFirst({
      where: {
        id,
        employeeId: req.user.id
      },
      include: {
        timeEntries: {
          orderBy: { date: 'asc' }
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    if (!timeCard) {
      return res.status(404).json({ error: 'Time card not found' });
    }

    res.json({ timeCard });
  } catch (error) {
    console.error('Get time card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update time entry
router.put('/entries/:entryId', [
  body('timeIn').optional().isISO8601(),
  body('timeOut').optional().isISO8601(),
  body('dayType').optional().isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID']),
  body('breakTime').optional().isInt({ min: 0 }),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entryId } = req.params;
    const { timeIn, timeOut, dayType, breakTime, notes } = req.body;

    // Verify entry belongs to user's time card
    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: entryId,
        timeCard: {
          employeeId: req.user.id,
          status: 'DRAFT' // Only allow editing draft time cards
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found or cannot be edited' });
    }

    // Calculate hours if both timeIn and timeOut are provided
    let hours = entry.hours;
    if (timeIn && timeOut) {
      const start = moment(timeIn);
      const end = moment(timeOut);
      const breakMinutes = breakTime || entry.breakTime || 0;
      hours = end.diff(start, 'hours', true) - (breakMinutes / 60);
      hours = Math.max(0, hours); // Ensure non-negative
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        ...(timeIn && { timeIn: new Date(timeIn) }),
        ...(timeOut && { timeOut: new Date(timeOut) }),
        ...(dayType && { dayType }),
        ...(breakTime !== undefined && { breakTime }),
        ...(notes !== undefined && { notes }),
        hours
      }
    });

    // Update time card total hours
    const timeCard = await prisma.timeCard.findUnique({
      where: { id: entry.timeCardId },
      include: { timeEntries: true }
    });

    const totalHours = timeCard.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    await prisma.timeCard.update({
      where: { id: entry.timeCardId },
      data: { totalHours }
    });

    res.json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Update time entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add time entry to current time card
router.post('/entries', [
  body('date').isISO8601(),
  body('timeIn').optional().isISO8601(),
  body('timeOut').optional().isISO8601(),
  body('dayType').optional().isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID']),
  body('breakTime').optional().isInt({ min: 0 }),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, timeIn, timeOut, dayType, breakTime, notes } = req.body;

    // Get or create current time card
    const currentPeriod = getCurrentPayPeriod();
    let timeCard = await prisma.timeCard.findFirst({
      where: {
        employeeId: req.user.id,
        periodStart: {
          gte: currentPeriod.start,
          lte: currentPeriod.end
        }
      }
    });

    if (!timeCard) {
      timeCard = await prisma.timeCard.create({
        data: {
          employeeId: req.user.id,
          periodStart: currentPeriod.start,
          periodEnd: currentPeriod.end,
          status: 'DRAFT'
        }
      });
    }

    if (timeCard.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Cannot add entries to submitted time card' });
    }

    // Calculate hours
    let hours = 0;
    if (timeIn && timeOut) {
      const start = moment(timeIn);
      const end = moment(timeOut);
      const breakMinutes = breakTime || 0;
      hours = end.diff(start, 'hours', true) - (breakMinutes / 60);
      hours = Math.max(0, hours);
    }

    const entry = await prisma.timeEntry.create({
      data: {
        timeCardId: timeCard.id,
        date: new Date(date),
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
        dayType: dayType || 'REGULAR',
        breakTime: breakTime || 0,
        notes,
        hours
      }
    });

    // Update time card total hours
    const totalHours = await prisma.timeEntry.aggregate({
      where: { timeCardId: timeCard.id },
      _sum: { hours: true }
    });

    await prisma.timeCard.update({
      where: { id: timeCard.id },
      data: { totalHours: totalHours._sum.hours || 0 }
    });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Add time entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit time card
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;

    const timeCard = await prisma.timeCard.findFirst({
      where: {
        id,
        employeeId: req.user.id,
        status: 'DRAFT'
      },
      include: { timeEntries: true }
    });

    if (!timeCard) {
      return res.status(404).json({ error: 'Time card not found or already submitted' });
    }

    const updatedTimeCard = await prisma.timeCard.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    // Create notification for manager
    if (req.user.managerId) {
      await prisma.notification.create({
        data: {
          userId: req.user.managerId,
          title: 'Time Card Submitted',
          message: `${req.user.firstName} ${req.user.lastName} has submitted their time card for review`,
          type: 'timecard',
          relatedId: id
        }
      });
    }

    res.json({ success: true, timeCard: updatedTimeCard });
  } catch (error) {
    console.error('Submit time card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manager routes - get team time cards
router.get('/team/pending', requireManager, async (req, res) => {
  try {
    let whereCondition;

    if (req.user.role === 'ADMIN') {
      whereCondition = { status: 'SUBMITTED' };
    } else {
      // Get direct reports
      const directReports = await prisma.user.findMany({
        where: { managerId: req.user.id },
        select: { id: true }
      });

      whereCondition = {
        employeeId: { in: directReports.map(r => r.id) },
        status: 'SUBMITTED'
      };
    }

    const timeCards = await prisma.timeCard.findMany({
      where: whereCondition,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true
          }
        },
        timeEntries: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });

    res.json({ timeCards });
  } catch (error) {
    console.error('Get team time cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject time card
router.post('/:id/review', requireManager, [
  body('action').isIn(['APPROVED', 'REJECTED']),
  body('comments').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { action, comments } = req.body;

    // Verify access to this time card
    let timeCard;
    if (req.user.role === 'ADMIN') {
      timeCard = await prisma.timeCard.findUnique({
        where: { id },
        include: { employee: true }
      });
    } else {
      timeCard = await prisma.timeCard.findFirst({
        where: {
          id,
          employee: { managerId: req.user.id }
        },
        include: { employee: true }
      });
    }

    if (!timeCard || timeCard.status !== 'SUBMITTED') {
      return res.status(404).json({ error: 'Time card not found or not submitted' });
    }

    const updatedTimeCard = await prisma.timeCard.update({
      where: { id },
      data: {
        status: action,
        approvedAt: action === 'APPROVED' ? new Date() : null,
        approvedBy: req.user.id,
        comments
      }
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        userId: timeCard.employeeId,
        title: `Time Card ${action === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Your time card for ${moment(timeCard.periodStart).format('MM/DD')} - ${moment(timeCard.periodEnd).format('MM/DD')} has been ${action.toLowerCase()}${comments ? `: ${comments}` : ''}`,
        type: 'timecard',
        relatedId: id
      }
    });

    res.json({ success: true, timeCard: updatedTimeCard });
  } catch (error) {
    console.error('Review time card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;