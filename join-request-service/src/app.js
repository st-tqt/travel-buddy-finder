'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

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

app.listen(PORT, () => {
  console.log(`[join-request-service] Running on port ${PORT}`);
});

module.exports = app;
