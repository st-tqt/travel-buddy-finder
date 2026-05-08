-- Chay file nay de tao database cho Trip Service (PostgreSQL)

CREATE DATABASE trip_service_db;

\c trip_service_db

CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  tags VARCHAR(255),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);