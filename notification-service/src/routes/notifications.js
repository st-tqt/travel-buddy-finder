'use strict';

<<<<<<< Updated upstream
const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Notification   = require('../models/Notification');

// ── GET /notifications/:userId ───────────────────────────────
// Trả về danh sách notifications của userId, mới nhất trước
// Response: { data: [...], total: number }
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Chỉ cho phép xem notification của chính mình
    if (req.user.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own notifications',
      });
=======
// GET /notifications/:userId
router.get('/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    let { page, limit } = req.query;

    // UUID validation
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
    
    // Ensure the user is only fetching their own notifications
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
>>>>>>> Stashed changes
    }

    // Pagination validation
    page = parseInt(page, 10);
    if (isNaN(page) || page <= 0) page = 1;
    
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 20;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const notifications = await Notification.findAll({
<<<<<<< Updated upstream
      where:  { userId },
      order:  [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      data:  notifications,
      total: notifications.length,
    });

  } catch (err) {
    console.error('[GET /notifications/:userId]', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ── PUT /notifications/:id/read ──────────────────────────────
// Cập nhật isRead = true
// Response: { message: "Marked as read" }
router.put('/:id/read', authMiddleware, async (req, res) => {
=======
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      data: notifications,
      total: notifications.length,
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
>>>>>>> Stashed changes
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

<<<<<<< Updated upstream
    // Chỉ cho phép cập nhật notification của chính mình
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own notifications',
      });
=======
    if (notification.userId !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
>>>>>>> Stashed changes
    }

    await notification.update({ isRead: true });

<<<<<<< Updated upstream
    return res.status(200).json({ message: 'Marked as read' });

  } catch (err) {
    console.error('[PUT /notifications/:id/read]', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
=======
    res.json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
});

// PUT /notifications/read-all
router.put('/read-all', authMiddleware, async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.userId.toString(), isRead: false } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
>>>>>>> Stashed changes
  }
});

module.exports = router;
