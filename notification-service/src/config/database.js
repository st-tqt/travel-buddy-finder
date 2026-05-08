'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NOTIFICATION_DB_NAME || 'notification_db',
  process.env.NOTIFICATION_DB_USER || 'postgres',
  process.env.NOTIFICATION_DB_PASSWORD || 'secret',
  {
    host:    process.env.NOTIFICATION_DB_HOST || 'localhost',
    port:    parseInt(process.env.NOTIFICATION_DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? (sql) => console.log('[DB]', sql)
      : false,
  }
);

module.exports = { sequelize };
