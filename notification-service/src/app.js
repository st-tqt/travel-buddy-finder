require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const notificationsRouter = require('./routes/notifications');
const { connectRabbitMQ } = require('./consumers/joinRequestConsumer');

const app = express();
app.use(express.json());

app.use('/notifications', notificationsRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 8084;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models
    await sequelize.sync();
    console.log('Models synchronized.');

    // Connect to RabbitMQ
    connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
