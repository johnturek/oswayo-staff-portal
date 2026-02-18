const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get calendar events
router.get('/', [
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  query('type').optional().isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startDate = req.query.start ? moment(req.query.start) : moment().startOf('month');
    const endDate = req.query.end ? moment(req.query.end) : moment().endOf('month');
    const dayType = req.query.type;

    const where = {
      date: {
        gte: startDate.toDate(),
        lte: endDate.toDate()
      },
      ...(dayType && { dayType })
    };

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific calendar event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create calendar event (Admin only)
router.post('/', requireRole(['ADMIN']), [
  body('title').notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('date').isISO8601(),
  body('dayType').isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID']),
  body('isRecurring').optional().isBoolean(),
  body('recurrenceRule').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, dayType, isRecurring, recurrenceRule } = req.body;

    // Check if event already exists for this date
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        date: new Date(date)
      }
    });

    if (existingEvent) {
      return res.status(400).json({ 
        error: 'An event already exists for this date',
        existing: existingEvent 
      });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        date: new Date(date),
        dayType,
        isRecurring: isRecurring || false,
        recurrenceRule,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // If recurring, create additional events based on recurrence rule
    if (isRecurring && recurrenceRule) {
      await createRecurringEvents(event, recurrenceRule);
    }

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update calendar event (Admin only)
router.put('/:id', requireRole(['ADMIN']), [
  body('title').optional().notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('date').optional().isISO8601(),
  body('dayType').optional().isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, date, dayType } = req.body;

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    // If date is being changed, check for conflicts
    if (date && new Date(date).getTime() !== existingEvent.date.getTime()) {
      const conflictingEvent = await prisma.calendarEvent.findFirst({
        where: {
          date: new Date(date),
          id: { not: id }
        }
      });

      if (conflictingEvent) {
        return res.status(400).json({ 
          error: 'An event already exists for this date',
          existing: conflictingEvent 
        });
      }
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(dayType && { dayType })
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete calendar event (Admin only)
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create events (Admin only) - for school year setup
router.post('/bulk', requireRole(['ADMIN']), [
  body('events').isArray({ min: 1 }),
  body('events.*.title').notEmpty().isLength({ max: 100 }),
  body('events.*.date').isISO8601(),
  body('events.*.dayType').isIn(['REGULAR', 'SICK', 'VACATION', 'PERSONAL', 'HOLIDAY', 'SNOW_DAY', 'PROFESSIONAL_DEVELOPMENT', 'BEREAVEMENT', 'JURY_DUTY', 'UNPAID']),
  body('events.*.description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { events } = req.body;

    // Check for date conflicts
    const dates = events.map(e => new Date(e.date));
    const existingEvents = await prisma.calendarEvent.findMany({
      where: {
        date: { in: dates }
      }
    });

    if (existingEvents.length > 0) {
      return res.status(400).json({ 
        error: 'Some dates already have events',
        conflicts: existingEvents
      });
    }

    // Create all events
    const createdEvents = await prisma.calendarEvent.createMany({
      data: events.map(event => ({
        ...event,
        date: new Date(event.date),
        createdById: req.user.id
      }))
    });

    res.status(201).json({ 
      success: true, 
      message: `Created ${createdEvents.count} events`,
      count: createdEvents.count
    });
  } catch (error) {
    console.error('Bulk create events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get work days for a date range (excluding holidays, snow days, etc.)
router.get('/workdays', [
  query('start').isISO8601(),
  query('end').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startDate = moment(req.query.start);
    const endDate = moment(req.query.end);

    // Get non-work days from calendar
    const nonWorkDays = await prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        },
        dayType: {
          in: ['HOLIDAY', 'SNOW_DAY']
        }
      },
      select: { date: true, dayType: true, title: true }
    });

    const nonWorkDates = nonWorkDays.map(day => moment(day.date).format('YYYY-MM-DD'));

    // Calculate work days
    const workDays = [];
    const current = startDate.clone();

    while (current.isSameOrBefore(endDate, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      
      // Skip weekends and non-work days
      if (current.day() !== 0 && current.day() !== 6 && !nonWorkDates.includes(dateStr)) {
        workDays.push({
          date: current.format('YYYY-MM-DD'),
          dayOfWeek: current.format('dddd')
        });
      }
      
      current.add(1, 'day');
    }

    res.json({ 
      workDays,
      totalWorkDays: workDays.length,
      nonWorkDays,
      dateRange: {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD')
      }
    });
  } catch (error) {
    console.error('Get work days error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get school year template (Admin only)
router.post('/school-year-template', requireRole(['ADMIN']), [
  body('year').isInt({ min: 2020, max: 2050 }),
  body('startMonth').isInt({ min: 1, max: 12 }),
  body('endMonth').isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, startMonth, endMonth } = req.body;

    // Generate typical school calendar events
    const events = [
      // Labor Day (first Monday in September)
      {
        title: 'Labor Day',
        date: getFirstMondayOfMonth(year, 8), // September (0-indexed)
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      },
      // Columbus Day (second Monday in October)
      {
        title: 'Columbus Day',
        date: getSecondMondayOfMonth(year, 9), // October
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      },
      // Thanksgiving Break
      {
        title: 'Thanksgiving Break',
        date: getThanksgivingDate(year),
        dayType: 'HOLIDAY',
        description: 'Thanksgiving Holiday - No School'
      },
      // Christmas Break (placeholder dates)
      {
        title: 'Winter Break Start',
        date: new Date(year, 11, 23), // December 23rd
        dayType: 'HOLIDAY',
        description: 'Winter Break Begins'
      },
      // New Year's Day
      {
        title: "New Year's Day",
        date: new Date(year + 1, 0, 1), // January 1st next year
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      },
      // Martin Luther King Jr. Day (third Monday in January)
      {
        title: 'Martin Luther King Jr. Day',
        date: getThirdMondayOfMonth(year + 1, 0), // January next year
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      },
      // Presidents Day (third Monday in February)
      {
        title: "Presidents' Day",
        date: getThirdMondayOfMonth(year + 1, 1), // February next year
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      },
      // Memorial Day (last Monday in May)
      {
        title: 'Memorial Day',
        date: getLastMondayOfMonth(year + 1, 4), // May next year
        dayType: 'HOLIDAY',
        description: 'Federal Holiday - No School'
      }
    ];

    // Filter events to be within the school year range
    const validEvents = events.filter(event => {
      const eventDate = moment(event.date);
      const schoolYearStart = moment([year, startMonth - 1, 1]);
      const schoolYearEnd = moment([endMonth > startMonth ? year : year + 1, endMonth - 1, 1]).endOf('month');
      return eventDate.isBetween(schoolYearStart, schoolYearEnd, null, '[]');
    });

    res.json({ 
      events: validEvents.map(event => ({
        ...event,
        date: moment(event.date).format('YYYY-MM-DD')
      })),
      schoolYear: `${year}-${year + 1}`,
      totalEvents: validEvents.length
    });
  } catch (error) {
    console.error('Get school year template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions for date calculations
function getFirstMondayOfMonth(year, month) {
  const date = new Date(year, month, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function getSecondMondayOfMonth(year, month) {
  const firstMonday = getFirstMondayOfMonth(year, month);
  return new Date(firstMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function getThirdMondayOfMonth(year, month) {
  const firstMonday = getFirstMondayOfMonth(year, month);
  return new Date(firstMonday.getTime() + 14 * 24 * 60 * 60 * 1000);
}

function getLastMondayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  while (lastDay.getDay() !== 1) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
}

function getThanksgivingDate(year) {
  // Fourth Thursday in November
  const november = new Date(year, 10, 1); // November 1st
  let thursday = november;
  
  // Find first Thursday
  while (thursday.getDay() !== 4) {
    thursday.setDate(thursday.getDate() + 1);
  }
  
  // Add 3 weeks to get fourth Thursday
  thursday.setDate(thursday.getDate() + 21);
  return thursday;
}

async function createRecurringEvents(baseEvent, recurrenceRule) {
  // Simple recurrence rule implementation
  // Format: "DAILY:30" or "WEEKLY:10" or "MONTHLY:12"
  const [frequency, count] = recurrenceRule.split(':');
  const numRecurrences = parseInt(count) || 1;
  
  const events = [];
  const startDate = moment(baseEvent.date);
  
  for (let i = 1; i <= numRecurrences; i++) {
    let nextDate = startDate.clone();
    
    switch (frequency) {
      case 'DAILY':
        nextDate.add(i, 'days');
        break;
      case 'WEEKLY':
        nextDate.add(i, 'weeks');
        break;
      case 'MONTHLY':
        nextDate.add(i, 'months');
        break;
      default:
        continue;
    }
    
    events.push({
      title: baseEvent.title,
      description: baseEvent.description,
      date: nextDate.toDate(),
      dayType: baseEvent.dayType,
      isRecurring: false, // Prevent infinite recursion
      createdById: baseEvent.createdById
    });
  }
  
  if (events.length > 0) {
    await prisma.calendarEvent.createMany({
      data: events
    });
  }
}

module.exports = router;