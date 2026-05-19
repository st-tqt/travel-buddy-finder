'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.JOIN_DB_NAME || 'join_db',
  process.env.JOIN_DB_USER || 'postgres',
  process.env.JOIN_DB_PASSWORD || 'secret',
  {
    host:    process.env.JOIN_DB_HOST || 'localhost',
    port:    parseInt(process.env.JOIN_DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const JoinRequest = sequelize.define('JoinRequest', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  tripId: {
    type:     DataTypes.UUID,
    allowNull: false,
  },
  userId: {        // người gửi request (từ JWT payload)
    type:     DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  message: {       // Lời nhắn gửi kèm khi request
    type: DataTypes.TEXT,
  },
}, {
  tableName:  'join_requests',
  timestamps: true,
  indexes: [
    { fields: ['tripId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    {
      unique: true,
      fields: ['tripId', 'userId'],
      where: { status: ['PENDING', 'APPROVED'] }
    }
  ],
});

module.exports = { sequelize, JoinRequest };
