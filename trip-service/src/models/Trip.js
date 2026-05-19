'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.TRIP_DB_NAME || 'trip_db',
  process.env.TRIP_DB_USER || 'postgres',
  process.env.TRIP_DB_PASSWORD || 'secret',
  {
    host:    process.env.TRIP_DB_HOST || 'localhost',
    port:    parseInt(process.env.TRIP_DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const Trip = sequelize.define('Trip', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  ownerId: {       // userId từ JWT payload
    type:     DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type:     DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type:     DataTypes.STRING(200),
    allowNull: false,
  },
  startDate: {
    type:     DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type:     DataTypes.DATEONLY,
    allowNull: false,
  },
  maxMembers: {
    type:         DataTypes.INTEGER,
    defaultValue: 10,
  },
  tags: {
    type:         DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  isPublic: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  currentMember: {
    type:         DataTypes.INTEGER,
    defaultValue: 1,
  },
  status: {
    type:         DataTypes.ENUM('OPEN', 'CLOSED', 'COMPLETED'),
    defaultValue: 'OPEN',
  },
  coverImage: {
    type:         DataTypes.STRING,
  },
}, {
  tableName:  'trips',
  timestamps: true,
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['status'] },
    { fields: ['location'] },
    { fields: ['startDate'] },
    { fields: ['createdAt'] }
  ],
});

const JoinRequest = sequelize.define('JoinRequest', {
  id: { type: DataTypes.UUID, primaryKey: true },
  tripId: { type: DataTypes.UUID },
  status: { type: DataTypes.STRING }
}, { tableName: 'join_requests', timestamps: false });

Trip.hasMany(JoinRequest, { as: 'joinRequests', foreignKey: 'tripId' });
JoinRequest.belongsTo(Trip, { foreignKey: 'tripId' });

module.exports = { sequelize, Trip, JoinRequest };
