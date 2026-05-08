'use strict';

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
    }

    const notifications = await Notification.findAll({
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
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Chỉ cho phép cập nhật notification của chính mình
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own notifications',
      });
    }

    await notification.update({ isRead: true });

    return res.status(200).json({ message: 'Marked as read' });

  } catch (err) {
    console.error('[PUT /notifications/:id/read]', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
