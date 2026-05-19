# Hướng dẫn gửi sự kiện RabbitMQ cho TV2 (Join Request Service)

## Thông tin RabbitMQ
- **Exchange**: `join-request-events` (type: `direct`)
- **Queue**: `notification.queue`
- **Routing key**: `join.approved` hoặc `join.rejected`
- **Payload**: `{ userId, tripId, tripName }`

## Code mẫu (Node.js + amqplib)

```javascript
const amqp = require('amqplib')

async function publishJoinEvent(userId, tripId, tripName, isApproved) {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const ch   = await conn.createChannel();
    
    // Đảm bảo exchange tồn tại
    await ch.assertExchange('join-request-events', 'direct', { durable: true });
    
    // Xác định routing key
    const routingKey = isApproved ? 'join.approved' : 'join.rejected';
    
    // Gửi sự kiện
    const payload = { userId, tripId, tripName };
    ch.publish(
      'join-request-events',
      routingKey,
      Buffer.from(JSON.stringify(payload))
    );
    
    console.log(`[RabbitMQ] Published event: ${routingKey}`);
    
    // Đóng kết nối
    setTimeout(() => {
      ch.close();
      conn.close();
    }, 500);
  } catch (error) {
    console.error('[RabbitMQ] Error publishing event:', error);
  }
}
```
