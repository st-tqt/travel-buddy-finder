const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NOTIFICATION_DB_NAME || 'notification_db',
  process.env.NOTIFICATION_DB_USER || 'postgres',
  process.env.NOTIFICATION_DB_PASSWORD || 'secret',
  {
    host: process.env.NOTIFICATION_DB_HOST || 'localhost',
    port: process.env.NOTIFICATION_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
