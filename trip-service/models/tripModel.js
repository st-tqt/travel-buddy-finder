const pool = require('../db');

const getAllTrips = async () => {
  const result = await pool.query('SELECT * FROM trips');
  return result.rows;
};

const getTripById = async (id) => {
  const result = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
  return result.rows[0];
};

const searchTrips = async (filters) => {
  let query = 'SELECT * FROM trips WHERE 1=1';
  const values = [];
  let i = 1;

  if (filters.location) {
    query += ` AND location ILIKE $${i}`;
    values.push('%' + filters.location + '%');
    i++;
  }

  if (filters.tags) {
    query += ` AND tags ILIKE $${i}`;
    values.push('%' + filters.tags + '%');
    i++;
  }

  if (filters.startDate) {
    query += ` AND start_date >= $${i}`;
    values.push(filters.startDate);
    i++;
  }

  if (filters.endDate) {
    query += ` AND end_date <= $${i}`;
    values.push(filters.endDate);
    i++;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

const createTrip = async (trip) => {
  const { title, description, location, startDate, endDate, tags, createdBy } = trip;
  const result = await pool.query(
    `INSERT INTO trips (title, description, location, start_date, end_date, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [title, description, location, startDate, endDate, tags, createdBy]
  );
  return result.rows[0].id;
};

const updateTrip = async (id, trip) => {
  const { title, description, location, startDate, endDate, tags } = trip;
  await pool.query(
    `UPDATE trips SET
      title = $1,
      description = $2,
      location = $3,
      start_date = $4,
      end_date = $5,
      tags = $6
     WHERE id = $7`,
    [title, description, location, startDate, endDate, tags, id]
  );
};

const deleteTrip = async (id) => {
  await pool.query('DELETE FROM trips WHERE id = $1', [id]);
};

module.exports = { getAllTrips, getTripById, searchTrips, createTrip, updateTrip, deleteTrip };