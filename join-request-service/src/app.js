'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { sequelize } = require('./models/JoinRequest');
const joinRoutes = require('./routes/joinRequests');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.JOIN_SERVICE_PORT || 8083;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/join-requests', joinRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'join-request-service' }));

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('[join-request-service] Database connected and synced successfully.');
    app.listen(PORT, () => {
      console.log(`[join-request-service] Running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[join-request-service] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

