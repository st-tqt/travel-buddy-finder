const pool = require('../db');

const getAllRequests = async () => {
  const result = await pool.query('SELECT * FROM join_requests');
  return result.rows;
};

const getRequestById = async (id) => {
  const result = await pool.query('SELECT * FROM join_requests WHERE id = $1', [id]);
  return result.rows[0];
};

const getRequestsByTripId = async (tripId) => {
  const result = await pool.query('SELECT * FROM join_requests WHERE trip_id = $1', [tripId]);
  return result.rows;
};

const getRequestsByUserId = async (userId) => {
  const result = await pool.query('SELECT * FROM join_requests WHERE user_id = $1', [userId]);
  return result.rows;
};

const createRequest = async (data) => {
  const { tripId, userId } = data;
  const result = await pool.query(
    'INSERT INTO join_requests (trip_id, user_id) VALUES ($1, $2) RETURNING id',
    [tripId, userId]
  );
  return result.rows[0].id;
};

const updateStatus = async (id, status) => {
  await pool.query(
    'UPDATE join_requests SET status = $1 WHERE id = $2',
    [status, id]
  );
};

module.exports = { getAllRequests, getRequestById, getRequestsByTripId, getRequestsByUserId, createRequest, updateStatus };