'use strict';

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../../shared/middleware/authMiddleware');

// ── POST /trips – Tạo trip mới (cần JWT) ────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    // TODO TV2: validate body, gọi Trip.create({ ...req.body, ownerId: req.user.userId })
    res.status(201).json({ message: 'TODO: create trip' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /trips – Danh sách trip công khai (filter: location/date/tag) ──
router.get('/', async (req, res) => {
  try {
    const { location, date, tag } = req.query;
    // TODO TV2: Trip.findAll({ where: { ...filters } })
    res.json({ message: 'TODO: list trips', filters: { location, date, tag } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /trips/:id – Chi tiết trip ──────────────────────────
router.get('/:id', async (req, res) => {
  try {
    // TODO TV2: Trip.findByPk(req.params.id)
    res.json({ message: 'TODO: get trip by id', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /trips/:id – Cập nhật trip (cần JWT, chỉ owner) ─────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // TODO TV2: kiểm tra trip.ownerId === req.user.userId
    res.json({ message: 'TODO: update trip', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /trips/:id – Xoá trip (cần JWT, chỉ owner) ───────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // TODO TV2: kiểm tra trip.ownerId === req.user.userId
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
