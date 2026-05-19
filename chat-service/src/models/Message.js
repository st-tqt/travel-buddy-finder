'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.CHAT_DB_NAME || 'chat_db',
  process.env.CHAT_DB_USER || 'postgres',
  process.env.CHAT_DB_PASSWORD || 'secret',
  {
    host:    process.env.CHAT_DB_HOST || 'localhost',
    port:    parseInt(process.env.CHAT_DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const Message = sequelize.define('Message', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  tripId: {
    type:     DataTypes.UUID,
    allowNull: false,
  },
  senderId: {     // userId từ JWT payload
    type:     DataTypes.UUID,
    allowNull: false,
  },
  senderEmail: {
    type:     DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type:     DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName:  'messages',
  timestamps: true,
  indexes: [
    { fields: ['tripId'] },
    { fields: ['tripId', 'createdAt'] },
    { fields: ['senderId'] }
  ],
});

module.exports = { sequelize, Message };
