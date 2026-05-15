const request = require('supertest');
const app = require('../app');
const { JoinRequest } = require('../models/JoinRequest');
const axios = require('axios');
const publisher = require('../publisher/joinRequestPublisher');

jest.mock('../models/JoinRequest');
jest.mock('axios');
jest.mock('../publisher/joinRequestPublisher');

// Mock authMiddleware
jest.mock('../../../shared/middleware/authMiddleware', () => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No token provided' });
    }
    req.user = { userId: 'user-1' };
    next();
  };
});

describe('Join Request Service API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /join-requests', () => {
    it('should create request successfully', async () => {
      JoinRequest.findOne.mockResolvedValue(null);
      JoinRequest.create.mockResolvedValue({ id: 'req-1', tripId: 'trip-1', userId: 'user-1' });

      const res = await request(app)
        .post('/join-requests')
        .set('Authorization', 'Bearer token')
        .send({ tripId: 'trip-1' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('req-1');
    });

    it('should return 401 if no token', async () => {
      const res = await request(app)
        .post('/join-requests')
        .send({ tripId: 'trip-1' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if missing tripId', async () => {
      const res = await request(app)
        .post('/join-requests')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 409 if already requested', async () => {
      JoinRequest.findOne.mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/join-requests')
        .set('Authorization', 'Bearer token')
        .send({ tripId: 'trip-1' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /join-requests?tripId=', () => {
    it('should return list of requests', async () => {
      axios.get.mockResolvedValue({ data: { ownerId: 'user-1' } });
      JoinRequest.findAll.mockResolvedValue([{ id: 'req-1', tripId: 'trip-1' }]);

      const res = await request(app)
        .get('/join-requests?tripId=trip-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should return 401 if no token', async () => {
      const res = await request(app).get('/join-requests?tripId=trip-1');
      expect(res.status).toBe(401);
    });

    it('should return 403 if not owner', async () => {
      axios.get.mockResolvedValue({ data: { ownerId: 'user-2' } });

      const res = await request(app)
        .get('/join-requests?tripId=trip-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /join-requests/:id/approve', () => {
    it('should approve successfully and publish event', async () => {
      const mockReq = { id: 'req-1', tripId: 'trip-1', userId: 'requester-1', save: jest.fn().mockResolvedValue(true) };
      JoinRequest.findByPk.mockResolvedValue(mockReq);
      axios.get.mockResolvedValue({ data: { ownerId: 'user-1', title: 'Trip Paris' } });

      const res = await request(app)
        .put('/join-requests/req-1/approve')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(mockReq.status).toBe('APPROVED');
      expect(mockReq.save).toHaveBeenCalled();
      expect(publisher.publishApproved).toHaveBeenCalledWith({
        userId: 'requester-1',
        tripId: 'trip-1',
        tripName: 'Trip Paris'
      });
    });

    it('should return 401 if no token', async () => {
      const res = await request(app).put('/join-requests/req-1/approve');
      expect(res.status).toBe(401);
    });

    it('should return 403 if not owner', async () => {
      const mockReq = { id: 'req-1', tripId: 'trip-1', userId: 'requester-1' };
      JoinRequest.findByPk.mockResolvedValue(mockReq);
      axios.get.mockResolvedValue({ data: { ownerId: 'user-2' } });

      const res = await request(app)
        .put('/join-requests/req-1/approve')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
      expect(publisher.publishApproved).not.toHaveBeenCalled();
    });
  });

  describe('PUT /join-requests/:id/reject', () => {
    it('should reject successfully and publish event', async () => {
      const mockReq = { id: 'req-1', tripId: 'trip-1', userId: 'requester-1', save: jest.fn().mockResolvedValue(true) };
      JoinRequest.findByPk.mockResolvedValue(mockReq);
      axios.get.mockResolvedValue({ data: { ownerId: 'user-1', title: 'Trip Paris' } });

      const res = await request(app)
        .put('/join-requests/req-1/reject')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(mockReq.status).toBe('REJECTED');
      expect(mockReq.save).toHaveBeenCalled();
      expect(publisher.publishRejected).toHaveBeenCalledWith({
        userId: 'requester-1',
        tripId: 'trip-1',
        tripName: 'Trip Paris'
      });
    });

    it('should return 401 if no token', async () => {
      const res = await request(app).put('/join-requests/req-1/reject');
      expect(res.status).toBe(401);
    });
  });
});
