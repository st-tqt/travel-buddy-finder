const request = require('supertest');
const app = require('../app');
const { Trip } = require('../models/Trip');

jest.mock('../models/Trip');

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

describe('Trip Service API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /trips', () => {
    it('should return array of trips', async () => {
      Trip.findAll.mockResolvedValue([{ id: 'trip-1', title: 'Trip 1' }]);
      const res = await request(app).get('/trips');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should filter by location', async () => {
      Trip.findAll.mockResolvedValue([{ id: 'trip-1', location: 'Hanoi' }]);
      const res = await request(app).get('/trips?location=Hanoi');
      expect(res.status).toBe(200);
      expect(Trip.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isPublic: true })
      }));
    });

    it('should return empty array if no trips found', async () => {
      Trip.findAll.mockResolvedValue([]);
      const res = await request(app).get('/trips');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /trips/:id', () => {
    it('should return trip by id', async () => {
      Trip.findByPk.mockResolvedValue({ id: 'trip-1', title: 'Trip 1' });
      const res = await request(app).get('/trips/trip-1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('trip-1');
    });

    it('should return 404 if trip not found', async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = await request(app).get('/trips/trip-unknown');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /trips', () => {
    it('should create trip with valid data', async () => {
      Trip.create.mockResolvedValue({ id: 'trip-1', title: 'New Trip', location: 'Hanoi', startDate: '2026-06-01' });
      const res = await request(app)
        .post('/trips')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New Trip', location: 'Hanoi', startDate: '2026-06-01', endDate: '2026-06-05' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe('trip-1');
    });

    it('should return 401 if no token', async () => {
      const res = await request(app).post('/trips').send({ title: 'Trip' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if missing required fields', async () => {
      const res = await request(app)
        .post('/trips')
        .set('Authorization', 'Bearer token')
        .send({ location: 'Hanoi' }); // Missing title and startDate
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /trips/:id', () => {
    it('should update trip successfully', async () => {
      const mockTrip = { id: 'trip-1', ownerId: 'user-1', update: jest.fn().mockResolvedValue(true) };
      Trip.findByPk.mockResolvedValue(mockTrip);
      
      const res = await request(app)
        .put('/trips/trip-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });
        
      expect(res.status).toBe(200);
      expect(mockTrip.update).toHaveBeenCalled();
    });

    it('should return 403 if not owner', async () => {
      const mockTrip = { id: 'trip-1', ownerId: 'user-2' };
      Trip.findByPk.mockResolvedValue(mockTrip);
      
      const res = await request(app)
        .put('/trips/trip-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });
        
      expect(res.status).toBe(403);
    });

    it('should return 404 if trip not found', async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = await request(app)
        .put('/trips/trip-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });
        
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /trips/:id', () => {
    it('should delete trip successfully', async () => {
      const mockTrip = { id: 'trip-1', ownerId: 'user-1', destroy: jest.fn().mockResolvedValue(true) };
      Trip.findByPk.mockResolvedValue(mockTrip);
      
      const res = await request(app)
        .delete('/trips/trip-1')
        .set('Authorization', 'Bearer token');
        
      expect(res.status).toBe(200);
      expect(mockTrip.destroy).toHaveBeenCalled();
    });

    it('should return 403 if not owner', async () => {
      const mockTrip = { id: 'trip-1', ownerId: 'user-2' };
      Trip.findByPk.mockResolvedValue(mockTrip);
      
      const res = await request(app)
        .delete('/trips/trip-1')
        .set('Authorization', 'Bearer token');
        
      expect(res.status).toBe(403);
    });

    it('should return 404 if trip not found', async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = await request(app)
        .delete('/trips/trip-1')
        .set('Authorization', 'Bearer token');
        
      expect(res.status).toBe(404);
    });
  });
});
