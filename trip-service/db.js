const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'trip_service_db',
  password: '',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Ket noi PostgreSQL thanh cong!'))
  .catch(err => {
    console.error('Ket noi that bai:', err.message);
    process.exit(1);
  });

module.exports = pool;