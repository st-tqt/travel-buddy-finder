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

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
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
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
