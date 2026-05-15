'use strict';

const express = require('express');
const router  = express.Router();
const { Op } = require('sequelize');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const { Trip } = require('../models/Trip');

// ── POST /trips – Tạo trip mới (cần JWT) ────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, location, startDate, endDate } = req.body;
    if (!title || !location || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const trip = await Trip.create({
      ...req.body,
      ownerId: req.user.userId
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /trips – Danh sách trip công khai (filter: location/date/tag) ──
router.get('/', async (req, res) => {
  try {
    const { location, date, tag } = req.query;
    const whereClause = { isPublic: true };

    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }
    if (date) {
      whereClause.startDate = { [Op.lte]: date };
      whereClause.endDate = { [Op.gte]: date };
    }
    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    const trips = await Trip.findAll({ where: whereClause });
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /trips/:id – Chi tiết trip ──────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /trips/:id – Cập nhật trip (cần JWT, chỉ owner) ─────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.ownerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    await trip.update(req.body);
    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /trips/:id – Xoá trip (cần JWT, chỉ owner) ───────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.ownerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    await trip.destroy();
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
