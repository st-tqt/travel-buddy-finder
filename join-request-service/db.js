const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'join_db',
  password: process.env.DB_PASSWORD || 'secret',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('Ket noi PostgreSQL thanh cong!'))
  .catch(err => {
    console.error('Ket noi that bai:', err.message);
    process.exit(1);
  });

module.exports = pool;