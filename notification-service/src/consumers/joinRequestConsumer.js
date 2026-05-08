'use strict';

/**
 * joinRequestConsumer.js – TV3
 * ─────────────────────────────────────────────────────────────
 * Subscribe queue "notification.queue" từ RabbitMQ
 * Nhận events từ Join Request Service (TV2) sau khi approve/reject
 *
 * Exchange : join-request-events (type: direct)
 * Queue    : notification.queue
 * Routing  : join.approved | join.rejected
 *
 * Event payload (TV2 publish):
 * {
 *   event    : "join.approved" | "join.rejected",
 *   userId   : "uuid-string",    ← người nhận notification
 *   tripId   : "uuid-string",
 *   tripName : "Tên chuyến đi"
 * }
 */

const amqplib     = require('amqplib');
const Notification = require('../models/Notification');

const RABBITMQ_URL  = process.env.RABBITMQ_URL      || 'amqp://localhost:5672';
const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE  || 'join-request-events';
const QUEUE_NAME    = process.env.RABBITMQ_QUEUE     || 'notification.queue';

async function startConsumer() {
  let retries = 0;
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 5000;

  while (retries < MAX_RETRIES) {
    try {
      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel    = await connection.createChannel();

      // Khai báo exchange dạng direct (TV2 publish vào đây)
      await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

      // Khai báo queue và bind với cả 2 routing key
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'join.approved');
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'join.rejected');

      // Đảm bảo xử lý từng message một (không overwhelm service)
      channel.prefetch(1);

      console.log(`[RabbitMQ] Connected. Listening on queue: "${QUEUE_NAME}"`);

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        let event;
        try {
          event = JSON.parse(msg.content.toString());
          console.log('[RabbitMQ] Received:', event);

          await handleEvent(event);
          channel.ack(msg);

        } catch (err) {
          console.error('[RabbitMQ] Error processing message:', err.message);
          // nack – không requeue để tránh infinite loop
          channel.nack(msg, false, false);
        }
      });

      // Reconnect tự động khi connection đóng bất ngờ
      connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed. Reconnecting in 5s...');
        setTimeout(startConsumer, RETRY_DELAY);
      });

      connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error:', err.message);
      });

      return; // Kết nối thành công, thoát vòng loop

    } catch (err) {
      retries++;
      console.warn(
        `[RabbitMQ] Not ready (attempt ${retries}/${MAX_RETRIES}). ` +
        `Retrying in ${RETRY_DELAY / 1000}s... Error: ${err.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  console.error('[RabbitMQ] Max retries reached. Consumer failed to start.');
}

/**
 * Xử lý từng loại event và lưu Notification vào DB
 */
async function handleEvent(event) {
  const { event: type, userId, tripId, tripName } = event;

  if (!userId || !tripId) {
    console.error('[RabbitMQ] Invalid event payload – missing userId or tripId:', event);
    return;
  }

  switch (type) {
    case 'join.approved':
      await Notification.create({
        userId,
        tripId,
        message: `Yêu cầu tham gia trip "${tripName}" đã được duyệt`,
        type:    'JOIN_APPROVED',
      });
      console.log(`[RabbitMQ] ✅ Saved JOIN_APPROVED notification for user ${userId}`);
      break;

    case 'join.rejected':
      await Notification.create({
        userId,
        tripId,
        message: `Yêu cầu tham gia trip "${tripName}" đã bị từ chối`,
        type:    'JOIN_REJECTED',
      });
      console.log(`[RabbitMQ] ❌ Saved JOIN_REJECTED notification for user ${userId}`);
      break;

    default:
      console.warn('[RabbitMQ] Unknown event type:', type);
  }
}

module.exports = { startConsumer };
