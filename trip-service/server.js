const express = require('express');
const app = express();

app.use(express.json());

const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', tripRoutes);

// Health check endpoint cho CI/CD & Docker
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'trip-service' }));

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log('Trip Service dang chay tai http://localhost:' + PORT);
});
