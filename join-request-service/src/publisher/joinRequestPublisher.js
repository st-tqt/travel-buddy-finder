const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ(retries = 5) {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    const connection = await amqp.connect(rabbitMqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange('join-request-events', 'direct', { durable: true });
    console.log('[RabbitMQ] Publisher connected');
  } catch (error) {
    if (retries === 0) {
      console.error('[RabbitMQ] Connection failed after 5 retries', error);
      return;
    }
    console.error(`[RabbitMQ] Connection failed, retrying in 5s... (${retries} retries left)`);
    setTimeout(() => connectRabbitMQ(retries - 1), 5000);
  }
}

// Khởi tạo kết nối
connectRabbitMQ();

async function publishApproved({ userId, tripId, tripName }) {
  try {
    if (!channel) {
      console.error('[RabbitMQ] Channel not ready');
      return;
    }
    const payload = JSON.stringify({ userId, tripId, tripName });
    channel.publish('join-request-events', 'join.approved', Buffer.from(payload), { persistent: true });
    console.log(`[RabbitMQ] Published join.approved for tripId: ${tripId}`);
  } catch (error) {
    console.error('[RabbitMQ] Publish error for join.approved:', error);
  }
}

async function publishRejected({ userId, tripId, tripName }) {
  try {
    if (!channel) {
      console.error('[RabbitMQ] Channel not ready');
      return;
    }
    const payload = JSON.stringify({ userId, tripId, tripName });
    channel.publish('join-request-events', 'join.rejected', Buffer.from(payload), { persistent: true });
    console.log(`[RabbitMQ] Published join.rejected for tripId: ${tripId}`);
  } catch (error) {
    console.error('[RabbitMQ] Publish error for join.rejected:', error);
  }
}

module.exports = {
  publishApproved,
  publishRejected
};
