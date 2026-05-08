'use strict';

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../../shared/middleware/authMiddleware');

// ── POST /join-requests – Gửi request tham gia (cần JWT) ────
router.post('/', authMiddleware, async (req, res) => {
  try {
    // TODO TV2: JoinRequest.create({ tripId: req.body.tripId, userId: req.user.userId })
    res.status(201).json({ message: 'TODO: create join request' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /join-requests?tripId= – Danh sách theo trip ────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.query;
    // TODO TV2: JoinRequest.findAll({ where: { tripId } })
    res.json({ message: 'TODO: list join requests', tripId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /join-requests/:id/approve – Duyệt (chỉ trip owner) ─
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    // TODO TV2:
    //   1. Tìm JoinRequest, verify trip.ownerId === req.user.userId
    //   2. Update status = 'APPROVED'
    //   3. Publish event vào RabbitMQ: { event: 'join.approved', tripId, userId, ... }
    res.json({ message: 'TODO: approve join request', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /join-requests/:id/reject – Từ chối (chỉ trip owner) ─
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    // TODO TV2:
    //   1. Tìm JoinRequest, verify trip.ownerId === req.user.userId
    //   2. Update status = 'REJECTED'
    //   3. Publish event vào RabbitMQ: { event: 'join.rejected', tripId, userId, ... }
    res.json({ message: 'TODO: reject join request', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
