'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const joinRoutes = require('./routes/joinRequests');

const app  = express();
const PORT = process.env.JOIN_SERVICE_PORT || 8083;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/join-requests', joinRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'join-request-service', timestamp: new Date() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[join-request-service] Running on port ${PORT}`);
});

module.exports = app;
