'use strict';

/**
 * join-request-service/src/publisher.js
 * Publish event lên RabbitMQ sau khi approve/reject join request
 *
 * Exchange: join-request-events (direct)
 * Keys:     join.approved | join.rejected
 * Payload:  { userId, tripId, tripName }
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE     = 'join-request-events';

let channel = null;

async function getChannel() {
  if (channel) return channel;
  const conn = await amqp.connect(RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
  console.log('[publisher] Connected to RabbitMQ, exchange:', EXCHANGE);
  return channel;
}

/**
 * @param {'join.approved'|'join.rejected'} routingKey
 * @param {{ userId: string, tripId: string, tripName?: string }} payload
 */
async function publishEvent(routingKey, payload) {
  try {
    const ch = await getChannel();
    const msg = JSON.stringify(payload);
    ch.publish(EXCHANGE, routingKey, Buffer.from(msg), { persistent: true });
    console.log(`[publisher] Published ${routingKey}:`, payload);
  } catch (err) {
    console.error('[publisher] Failed to publish event:', err.message);
    // Reset channel để reconnect lần sau
    channel = null;
  }
}

module.exports = { publishEvent };
