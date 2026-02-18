const express = require('express');
const { query, body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get user's notifications
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isRead').optional().isBoolean(),
  query('type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(req.query.isRead !== undefined && { isRead: req.query.isRead === 'true' }),
      ...(req.query.type && { type: req.query.type })
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false
        }
      })
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ success: true, notification: updatedNotification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all read notifications
router.delete('/clear-read', async (req, res) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        userId: req.user.id,
        isRead: true
      }
    });

    res.json({ success: true, deletedCount: result.count });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create system notification (Admin only)
router.post('/system', requireRole(['ADMIN']), [
  body('title').notEmpty().trim().isLength({ max: 100 }),
  body('message').notEmpty().trim().isLength({ max: 500 }),
  body('type').optional().isString(),
  body('userIds').optional().isArray(),
  body('userIds.*').optional().isUUID(),
  body('broadcast').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, userIds, broadcast } = req.body;

    let targetUserIds = [];

    if (broadcast) {
      // Send to all active users
      const allUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      targetUserIds = allUsers.map(user => user.id);
    } else if (userIds && userIds.length > 0) {
      // Send to specific users
      targetUserIds = userIds;
    } else {
      return res.status(400).json({ error: 'Must specify userIds or set broadcast to true' });
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'system'
    }));

    const result = await prisma.notification.createMany({
      data: notifications
    });

    res.status(201).json({ 
      success: true, 
      message: `Created ${result.count} notifications`,
      recipientCount: result.count
    });
  } catch (error) {
    console.error('Create system notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification statistics (Admin only)
router.get('/admin/stats', requireRole(['ADMIN']), async (req, res) => {
  try {
    const [totalNotifications, unreadNotifications, notificationsByType] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]);

    const typeStats = notificationsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {});

    res.json({
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      byType: typeStats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all notifications for admin view (Admin only)
router.get('/admin/all', requireRole(['ADMIN']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isString(),
  query('isRead').optional().isBoolean(),
  query('userId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.isRead !== undefined && { isRead: req.query.isRead === 'true' }),
      ...(req.query.userId && { userId: req.query.userId })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;