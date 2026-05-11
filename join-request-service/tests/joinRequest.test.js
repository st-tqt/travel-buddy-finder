const request = require('supertest');
const express = require('express');
const joinRequestRoutes = require('../routes/joinRequestRoutes');

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} })
}));

const app = express();
app.use(express.json());
app.use('/api/join-requests', joinRequestRoutes);

describe('Join Request Service API', () => {

  it('GET /api/join-requests - tra ve danh sach requests', async () => {
    const res = await request(app).get('/api/join-requests');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/join-requests/trip/2 - tra ve requests theo trip', async () => {
    const res = await request(app).get('/api/join-requests/trip/2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/join-requests/user/1 - tra ve requests theo user', async () => {
    const res = await request(app).get('/api/join-requests/user/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/join-requests - tao request thanh cong', async () => {
    const res = await request(app)
      .post('/api/join-requests')
      .send({ tripId: 2, userId: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
  });

  it('PUT /api/join-requests/9999/approve - tra ve 404 neu khong tim thay', async () => {
    const res = await request(app).put('/api/join-requests/9999/approve');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('PUT /api/join-requests/9999/reject - tra ve 404 neu khong tim thay', async () => {
    const res = await request(app).put('/api/join-requests/9999/reject');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

});