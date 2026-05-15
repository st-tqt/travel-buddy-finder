const express = require('express');
const app = express();

app.use(express.json());

const joinRequestRoutes = require('./routes/joinRequestRoutes');
app.use('/api/join-requests', joinRequestRoutes);

// Health check endpoint cho CI/CD & Docker
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'join-request-service' }));

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log('Join Request Service dang chay tai http://localhost:' + PORT);
});