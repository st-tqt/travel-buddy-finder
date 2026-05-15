'use strict';

const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const { JoinRequest } = require('../models/JoinRequest');
const { publishApproved, publishRejected } = require('../publisher/joinRequestPublisher');

const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'http://localhost:8082';

// ── POST /join-requests – Gửi request tham gia (cần JWT) ────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId, message } = req.body;
    if (!tripId) return res.status(400).json({ error: 'Missing tripId' });

    const existing = await JoinRequest.findOne({ where: { tripId, userId: req.user.userId } });
    if (existing) return res.status(409).json({ error: 'Join request already exists' });

    const joinRequest = await JoinRequest.create({ tripId, userId: req.user.userId, message });
    res.status(201).json(joinRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /join-requests?tripId= – Danh sách theo trip ────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'Missing tripId' });

    // Lấy thông tin trip để check owner
    try {
      const response = await axios.get(`${TRIP_SERVICE_URL}/trips/${tripId}`, {
        headers: { 'Authorization': req.headers['authorization'] }
      });
      if (response.data.ownerId !== req.user.userId) {
        return res.status(403).json({ error: 'Not the trip owner' });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      return res.status(500).json({ error: 'Error validating trip owner' });
    }

    const requests = await JoinRequest.findAll({ where: { tripId } });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /join-requests/:id/approve – Duyệt (chỉ trip owner) ─
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findByPk(req.params.id);
    if (!joinRequest) return res.status(404).json({ error: 'Join request not found' });

    // Verify trip.ownerId === req.user.userId
    let tripName = 'Unknown Trip';
    try {
      const response = await axios.get(`${TRIP_SERVICE_URL}/trips/${joinRequest.tripId}`, {
        headers: { 'Authorization': req.headers['authorization'] }
      });
      if (response.data.ownerId !== req.user.userId) {
        return res.status(403).json({ error: 'Not the trip owner' });
      }
      tripName = response.data.title || response.data.name || 'Unknown Trip';
    } catch (err) {
      return res.status(500).json({ error: 'Error validating trip owner' });
    }

    joinRequest.status = 'APPROVED';
    await joinRequest.save();

    res.json({ message: 'Approved' });

    publishApproved({
      userId: joinRequest.userId,
      tripId: joinRequest.tripId,
      tripName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /join-requests/:id/reject – Từ chối (chỉ trip owner) ─
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findByPk(req.params.id);
    if (!joinRequest) return res.status(404).json({ error: 'Join request not found' });

    // Verify trip.ownerId === req.user.userId
    let tripName = 'Unknown Trip';
    try {
      const response = await axios.get(`${TRIP_SERVICE_URL}/trips/${joinRequest.tripId}`, {
        headers: { 'Authorization': req.headers['authorization'] }
      });
      if (response.data.ownerId !== req.user.userId) {
        return res.status(403).json({ error: 'Not the trip owner' });
      }
      tripName = response.data.title || response.data.name || 'Unknown Trip';
    } catch (err) {
      return res.status(500).json({ error: 'Error validating trip owner' });
    }

    joinRequest.status = 'REJECTED';
    await joinRequest.save();

    res.json({ message: 'Rejected' });

    publishRejected({
      userId: joinRequest.userId,
      tripId: joinRequest.tripId,
      tripName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
