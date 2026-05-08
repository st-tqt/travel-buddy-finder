const request = require('supertest');
const express = require('express');
const tripRoutes = require('../routes/tripRoutes');

const app = express();
app.use(express.json());
app.use('/api/trips', tripRoutes);

describe('Trip Service API', () => {

  // Test GET all trips
  it('GET /api/trips - tra ve danh sach trips', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test GET trip by ID hop le
  it('GET /api/trips/1 - tra ve trip hop le', async () => {
    const res = await request(app).get('/api/trips/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title');
  });

  // Test GET trip by ID khong ton tai
  it('GET /api/trips/9999 - tra ve 404 neu khong tim thay', async () => {
    const res = await request(app).get('/api/trips/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  // Test POST tao trip moi
  it('POST /api/trips - tao trip moi thanh cong', async () => {
    const res = await request(app)
      .post('/api/trips')
      .send({
        title: 'Test Trip',
        description: 'Mo ta test',
        location: 'Ha Noi',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        tags: 'test,hanoi',
        createdBy: 1
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('tripId');
  });

  // Test POST thieu title
  it('POST /api/trips - loi neu thieu title', async () => {
    const res = await request(app)
      .post('/api/trips')
      .send({
        description: 'Thieu title',
        location: 'Ha Noi',
        createdBy: 1
      });
    expect(res.statusCode).toBe(500);
  });

  // Test filter theo location
  it('GET /api/trips?location=Ha Long - filter theo location', async () => {
    const res = await request(app).get('/api/trips?location=Ha Long');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test PUT cap nhat trip
  it('PUT /api/trips/1 - cap nhat trip thanh cong', async () => {
    const res = await request(app)
      .put('/api/trips/1')
      .send({
        title: 'Trip Updated',
        description: 'Mo ta moi',
        location: 'Ha Long',
        startDate: '2025-07-01',
        endDate: '2025-07-05',
        tags: 'bien,camping'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Test DELETE trip khong ton tai
  it('DELETE /api/trips/9999 - tra ve 404 neu khong tim thay', async () => {
    const res = await request(app).delete('/api/trips/9999');
    expect(res.statusCode).toBe(404);
  });

});