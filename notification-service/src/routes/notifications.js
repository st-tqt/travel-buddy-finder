const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// GET /notifications/:userId
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the user is only fetching their own notifications
    // Assuming authMiddleware attaches req.user with userId
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: Cannot access other user's notifications" });
    }

    // Pagination validation
    let page = req.query.page;
    page = parseInt(page, 10);
    if (isNaN(page) || page <= 0) page = 1;
    
    let limit = req.query.limit;
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 20;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const [notificationsResult, unreadCount] = await Promise.all([
      Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      }),
      Notification.count({ where: { userId, isRead: false } })
    ]);

    res.json({
      data: notificationsResult.rows,
      total: notificationsResult.count,
      unreadCount,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
});

// GET /notifications/:userId/unread-count
router.get('/:userId/unread-count', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const count = await Notification.count({
      where: { userId, isRead: false }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
});

// PUT /notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Optional: check if the notification belongs to the authenticated user
    if (notification.userId !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Forbidden: Not your notification" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
});

// PUT /notifications/read-all
router.put('/read-all', authMiddleware, async (req, res, next) => {
  try {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      { where: { userId: req.user.userId.toString(), isRead: false } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
