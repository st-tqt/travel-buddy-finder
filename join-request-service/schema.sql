CREATE DATABASE join_request_db;

\c join_request_db

CREATE TABLE join_requests (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);