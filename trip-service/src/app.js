'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const tripRoutes = require('./routes/trips');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.TRIP_SERVICE_PORT || 8082;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/trips', tripRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'trip-service' }));

// ── Error handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[trip-service] Running on port ${PORT}`);
});

module.exports = app;
