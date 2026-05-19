'use strict';

/**
 * join-request-service/src/publisher.js
 * Publish event lên RabbitMQ sau khi approve/reject join request
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE     = 'join-request-events';

let connection = null;
let channel = null;

async function getChannel() {
  if (!channel) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
      console.log('[publisher] Connected to RabbitMQ, exchange:', EXCHANGE);

      connection.on('error', async (err) => {
        console.error('[RabbitMQ] Connection error:', err);
        channel = null;
        connection = null;
        setTimeout(getChannel, 5000);
      });
    } catch (err) {
      console.error('[RabbitMQ] Failed to create channel:', err.message);
      channel = null;
      connection = null;
      setTimeout(getChannel, 5000);
    }
  }
  return channel;
}

/**
 * @param {'join.approved'|'join.rejected'} routingKey
 * @param {{ userId: string, tripId: string, tripName?: string }} payload
 */
async function publishEvent(routingKey, payload) {
  try {
    const ch = await getChannel();
    if (ch) {
      ch.publish(
        EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
      console.log(`[publisher] Published ${routingKey}:`, payload);
    } else {
      console.error('[RabbitMQ] Channel not available, dropping message');
    }
  } catch (err) {
    console.error('[RabbitMQ] Publish failed:', err.message);
    channel = null;
  }
}

module.exports = { publishEvent };
