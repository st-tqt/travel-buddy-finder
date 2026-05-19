const amqp = require('amqplib');
const Notification = require('../models/Notification');

async function connectRabbitMQ() {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();

    const exchange = process.env.RABBITMQ_EXCHANGE || 'join-request-events';
    const queue = process.env.RABBITMQ_QUEUE || 'notification.queue';

    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, 'join.approved');
    await channel.bindQueue(queue, exchange, 'join.rejected');
    
    channel.prefetch(10);

    console.log(`[RabbitMQ] Waiting for messages in queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const routingKey = msg.fields.routingKey;
        const content = msg.content.toString();
        
        try {
          const payload = JSON.parse(content);
          console.log('[RabbitMQ] Received event:', routingKey, payload);

          if (routingKey === 'join.approved') {
            await Notification.create({
              userId: payload.userId.toString(),
              tripId: payload.tripId.toString(),
              message: `Yêu cầu tham gia trip "${payload.tripName}" đã được duyệt`,
              type: 'JOIN_APPROVED'
            });
          } else if (routingKey === 'join.rejected') {
            await Notification.create({
              userId: payload.userId.toString(),
              tripId: payload.tripId.toString(),
              message: `Yêu cầu tham gia trip "${payload.tripName}" đã bị từ chối`,
              type: 'JOIN_REJECTED'
            });
          }

          channel.ack(msg);
        } catch (error) {
          console.error('[RabbitMQ] Error processing message:', error);
          // If we fail to parse or insert, we still ack or reject. Here we ack to discard bad messages.
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error('[RabbitMQ] Connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
}

module.exports = { connectRabbitMQ };
