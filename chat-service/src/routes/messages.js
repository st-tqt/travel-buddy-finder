'use strict';

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const { Message } = require('../models/Message');

// ── GET /messages?tripId= – Lịch sử tin nhắn của trip ───────
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { tripId, limit = 50, offset = 0 } = req.query;

    if (!tripId) {
      return res.status(400).json({ error: 'Bad Request', message: 'tripId query param is required' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    let maxLimit = parseInt(limit, 10) || 50;
    if (maxLimit > 100) maxLimit = 100;
    if (maxLimit <= 0) maxLimit = 50;
    
    let parsedOffset = parseInt(offset, 10) || 0;
    // Alternative pagination by page
    if (req.query.page && !req.query.offset) {
      parsedOffset = (page - 1) * maxLimit;
    }

    const messages = await Message.findAll({
      where: { tripId },
      order: [['createdAt', 'ASC']],
      limit: maxLimit,
      offset: parsedOffset,
    });

    res.json({ data: messages, tripId, limit: maxLimit, offset: parsedOffset });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
