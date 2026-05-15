const joinRequestModel = require('../models/joinRequestModel');
const axios = require('axios');
const { publishEvent } = require('../publisher');

const TRIP_SERVICE_URL = 'http://localhost:3001';
const USER_SERVICE_URL = 'http://localhost:3000';

const getRequests = async (req, res) => {
  try {
    const data = await joinRequestModel.getAllRequests();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRequestsByTrip = async (req, res) => {
  try {
    const data = await joinRequestModel.getRequestsByTripId(req.params.tripId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRequestsByUser = async (req, res) => {
  try {
    const data = await joinRequestModel.getRequestsByUserId(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { tripId, userId } = req.body;

    // Kiem tra trip co ton tai khong
    try {
      await axios.get(`${TRIP_SERVICE_URL}/api/trips/${tripId}`);
    } catch (err) {
      return res.status(404).json({ message: `Trip ${tripId} khong ton tai` });
    }

    // Kiem tra user co ton tai khong
    try {
      await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`);
    } catch (err) {
      return res.status(404).json({ message: `User ${userId} khong ton tai` });
    }

    const id = await joinRequestModel.createRequest(req.body);
    res.status(201).json({ message: 'Gui yeu cau tham gia thanh cong', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await joinRequestModel.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Khong tim thay join request' });
    if (request.status !== 'pending') return res.status(400).json({ message: `Request dang o trang thai ${request.status}, khong the duyet` });

    await joinRequestModel.updateStatus(req.params.id, 'approved');

    // Publish event
    publishEvent('join.approved', {
      requestId: request.id,
      tripId: request.tripId,
      userId: request.userId
    });

    res.json({ message: 'Duyet yeu cau thanh cong', requestId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await joinRequestModel.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Khong tim thay join request' });
    if (request.status !== 'pending') return res.status(400).json({ message: `Request dang o trang thai ${request.status}, khong the tu choi` });

    await joinRequestModel.updateStatus(req.params.id, 'rejected');

    // Publish event
    publishEvent('join.rejected', {
      requestId: request.id,
      tripId: request.tripId,
      userId: request.userId
    });

    res.json({ message: 'Tu choi yeu cau thanh cong', requestId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    await joinRequestModel.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Cap nhat trang thai thanh cong' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRequests, getRequestsByTrip, getRequestsByUser, createRequest, approveRequest, rejectRequest, updateStatus };