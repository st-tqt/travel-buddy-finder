'use strict';

const express = require('express');
const router  = express.Router();
const { Op, Sequelize } = require('sequelize');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const { Trip, JoinRequest } = require('../models/Trip');

// ── GET /trips/my – Danh sách trip của mình ─────────────────
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const { count, rows } = await Trip.findAndCountAll({
      where: { ownerId: req.user.userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });
    res.json({ total: count, totalPages: Math.ceil(count / limit), data: rows });
  } catch (err) {
    next(err);
  }
});

// ── POST /trips – Tạo trip mới (cần JWT) ────────────────────
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    let { title, location, description, startDate, endDate, maxMembers, tags, isPublic, coverImage } = req.body;

    // Input sanitization
    title = title ? String(title).trim() : '';
    location = location ? String(location).trim() : '';
    description = description ? String(description).trim() : '';

    if (!title) {
      const err = new Error('Title cannot be blank');
      err.status = 400;
      throw err;
    }
    if (!location) {
      const err = new Error('Location cannot be blank');
      err.status = 400;
      throw err;
    }

    if (maxMembers < 1) {
      const err = new Error('maxMembers must be at least 1');
      err.status = 400;
      throw err;
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      const err = new Error('startDate cannot be in the past');
      err.status = 400;
      throw err;
    }
    if (end <= start) {
      const err = new Error('endDate must be after startDate');
      err.status = 400;
      throw err;
    }

    // Validate tags
    if (tags) {
      if (!Array.isArray(tags)) {
        const err = new Error('tags must be an array of strings');
        err.status = 400;
        throw err;
      }
      if (tags.length > 10) {
        const err = new Error('Maximum 10 tags allowed');
        err.status = 400;
        throw err;
      }
      for (const t of tags) {
        if (typeof t !== 'string' || t.length > 20) {
          const err = new Error('Each tag must be a string up to 20 characters');
          err.status = 400;
          throw err;
        }
      }
    } else {
      tags = [];
    }

    const trip = await Trip.create({
      ownerId: req.user.userId,
      title,
      location,
      description,
      startDate,
      endDate,
      maxMembers,
      tags,
      isPublic: isPublic !== undefined ? isPublic : true,
      coverImage,
      currentMember: 1,
      status: 'OPEN'
    });

    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

// ── GET /trips – Danh sách trip công khai (filter: location/date/tags) ──
router.get('/', async (req, res, next) => {
  try {
    const { location, date, tag, page = 1, limit = 10 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    
    const where = {
      isPublic: true,
      status: 'OPEN'
    };

    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }
    if (date) {
      where.startDate = { [Op.lte]: date };
      where.endDate = { [Op.gte]: date };
    }
    if (tag) {
      where.tags = { [Op.contains]: [tag] };
    }

    const { count, rows } = await Trip.findAndCountAll({
      attributes: ['id', 'title', 'location', 'startDate', 'endDate', 'maxMembers', 'currentMember', 'tags', 'status', 'coverImage', 'createdAt', 'ownerId'],
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /trips/:id – Chi tiết trip ──────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('joinRequests.id')), 'requestCount']
        ]
      },
      include: [{
        model: JoinRequest,
        as: 'joinRequests',
        attributes: [],
        where: { status: 'PENDING' },
        required: false
      }],
      group: ['Trip.id']
    });

    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// ── PUT /trips/:id – Cập nhật trip (cần JWT, chỉ owner) ─────
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    if (trip.ownerId !== req.user.userId) {
      const err = new Error('Forbidden: Not the owner');
      err.status = 403;
      throw err;
    }

    // if update includes currentMember, check if it hits max
    const updates = req.body;
    if (updates.currentMember !== undefined) {
      if (updates.currentMember >= trip.maxMembers) {
        updates.status = 'CLOSED';
      }
    }

    await trip.update(updates);
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /trips/:id – Xoá trip (cần JWT, chỉ owner) ───────
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }
    if (trip.ownerId !== req.user.userId) {
      const err = new Error('Forbidden: Not the owner');
      err.status = 403;
      throw err;
    }

    await trip.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
