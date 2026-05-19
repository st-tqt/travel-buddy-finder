'use strict';

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const { sequelize, JoinRequest } = require('../models/JoinRequest');
const { publishEvent } = require('../publisher');

const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'http://trip-service:8082';

async function getTripDetails(tripId) {
  try {
    const response = await fetch(`${TRIP_SERVICE_URL}/trips/${tripId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch trip details: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    throw new Error('Error communicating with trip-service: ' + err.message);
  }
}

// ── GET /join-requests/my – Lấy request của tôi ───────────────
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const requests = await JoinRequest.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// ── POST /join-requests – Gửi request tham gia (cần JWT) ────
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { tripId, message } = req.body;
    const userId = req.user.userId;

    // Verify trip exists and check logic
    const trip = await getTripDetails(tripId);
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }

    if (trip.ownerId === userId) {
      const err = new Error('Cannot join your own trip');
      err.status = 400;
      throw err;
    }

    if (trip.status === 'CLOSED' || trip.status === 'COMPLETED') {
      const err = new Error(`Cannot join a ${trip.status.toLowerCase()} trip`);
      err.status = 400;
      throw err;
    }

    if (trip.currentMember >= trip.maxMembers) {
      const err = new Error('Trip is already full');
      err.status = 400;
      throw err;
    }

    // Check for duplicate request
    const existingReq = await JoinRequest.findOne({
      where: { tripId, userId, status: ['PENDING', 'APPROVED'] }
    });
    if (existingReq) {
      const err = new Error('You have already sent a request for this trip');
      err.status = 409;
      throw err;
    }

    const joinReq = await JoinRequest.create({ tripId, userId, message, status: 'PENDING' });
    res.status(201).json(joinReq);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      err.status = 409;
      err.message = 'You have already sent a request for this trip';
    }
    next(err);
  }
});

// ── GET /join-requests?tripId= – Danh sách theo trip ────────
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { tripId } = req.query;
    if (!tripId) {
      const err = new Error('tripId is required');
      err.status = 400;
      throw err;
    }

    const trip = await getTripDetails(tripId);
    if (!trip) {
      const err = new Error('Trip not found');
      err.status = 404;
      throw err;
    }

    if (trip.ownerId !== req.user.userId) {
      const err = new Error('Forbidden: Not the owner of this trip');
      err.status = 403;
      throw err;
    }

    const requests = await JoinRequest.findAll({ where: { tripId } });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// ── PUT /join-requests/:id/approve – Duyệt (chỉ trip owner) ─
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Concurrent request protection
    await sequelize.transaction(async (t) => {
      const joinReq = await JoinRequest.findByPk(id, { lock: true, transaction: t });
      if (!joinReq) {
        const err = new Error('Join request not found');
        err.status = 404;
        throw err;
      }

      if (joinReq.status !== 'PENDING') {
        const err = new Error('Request already processed');
        err.status = 400;
        throw err;
      }

      // Verify trip ownership
      const trip = await getTripDetails(joinReq.tripId);
      if (!trip) {
        const err = new Error('Trip not found');
        err.status = 404;
        throw err;
      }
      if (trip.ownerId !== req.user.userId) {
        const err = new Error('Forbidden: Not the owner of this trip');
        err.status = 403;
        throw err;
      }

      if (trip.currentMember >= trip.maxMembers) {
        const err = new Error('Trip is already full');
        err.status = 400;
        throw err;
      }

      await joinReq.update({ status: 'APPROVED' }, { transaction: t });

      // Cập nhật currentMember của trip-service qua HTTP nội bộ
      try {
        const newCurrentMember = trip.currentMember + 1;
        const updateRes = await fetch(`${TRIP_SERVICE_URL}/trips/${trip.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Pass auth token from current request to internal call
            'Authorization': req.headers.authorization
          },
          body: JSON.stringify({ currentMember: newCurrentMember })
        });
        if (!updateRes.ok) {
          throw new Error(`Failed to update trip-service: ${updateRes.statusText}`);
        }
      } catch (e) {
        console.error('[Internal Sync Error]', e.message);
        // Do not rollback just log because of eventual consistency approach
      }

      // Publish event
      await publishEvent('join.approved', {
        userId: joinReq.userId,
        tripId: trip.id,
        tripName: trip.title
      });

      res.json(joinReq);
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /join-requests/:id/reject – Từ chối (chỉ trip owner) ─
router.put('/:id/reject', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await sequelize.transaction(async (t) => {
      const joinReq = await JoinRequest.findByPk(id, { lock: true, transaction: t });
      if (!joinReq) {
        const err = new Error('Join request not found');
        err.status = 404;
        throw err;
      }

      if (joinReq.status !== 'PENDING') {
        const err = new Error('Request already processed');
        err.status = 400;
        throw err;
      }

      const trip = await getTripDetails(joinReq.tripId);
      if (!trip) {
        const err = new Error('Trip not found');
        err.status = 404;
        throw err;
      }
      if (trip.ownerId !== req.user.userId) {
        const err = new Error('Forbidden: Not the owner of this trip');
        err.status = 403;
        throw err;
      }

      await joinReq.update({ status: 'REJECTED' }, { transaction: t });

      await publishEvent('join.rejected', {
        userId: joinReq.userId,
        tripId: trip.id,
        tripName: trip.title
      });

      res.json(joinReq);
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /join-requests/:id – Xóa request ─────────────────
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const joinReq = await JoinRequest.findByPk(id);
    if (!joinReq) {
      const err = new Error('Join request not found');
      err.status = 404;
      throw err;
    }

    if (joinReq.userId !== req.user.userId) {
      const err = new Error('Forbidden: Not your request');
      err.status = 403;
      throw err;
    }

    if (joinReq.status === 'APPROVED') {
      const err = new Error('Cannot delete an approved request');
      err.status = 400;
      throw err;
    }

    await joinReq.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
