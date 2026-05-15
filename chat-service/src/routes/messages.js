'use strict';

const express = require('express');
const router  = express.Router();
// Tạm thời mock authMiddleware để qua lỗi Docker Context ở Sprint 1
const authMiddleware = (req, res, next) => next();

// ── GET /messages?tripId= – Lịch sử tin nhắn của trip ───────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tripId, limit = 50, offset = 0 } = req.query;

    if (!tripId) {
      return res.status(400).json({ error: 'Bad Request', message: 'tripId query param is required' });
    }

    // TODO TV3: Message.findAll({
    //   where: { tripId },
    //   order: [['createdAt', 'ASC']],
    //   limit: parseInt(limit),
    //   offset: parseInt(offset),
    // })

    res.json({ message: 'TODO: get messages', tripId, limit, offset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
