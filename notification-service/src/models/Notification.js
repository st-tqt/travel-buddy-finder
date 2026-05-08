'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Notification Model
 *
 * Lưu ý: userId & tripId là STRING, không dùng FK cứng
 * vì đây là cross-service data (Database per Service pattern)
 */
const Notification = sequelize.define('Notification', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  userId: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'UUID string của user – không FK vì khác service',
  },
  tripId: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'UUID string của trip – không FK vì khác service',
  },
  message: {
    type:      DataTypes.STRING(500),
    allowNull: false,
  },
  type: {
    type:      DataTypes.ENUM('JOIN_APPROVED', 'JOIN_REJECTED', 'GENERAL'),
    allowNull: false,
  },
  isRead: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName:  'notifications',
  timestamps: true,   // tự thêm createdAt, updatedAt
  indexes: [
    { fields: ['userId'] },   // index để query theo userId nhanh hơn
  ],
});

module.exports = Notification;
