// Mock RabbitMQ publisher
// Sau nay chi can thay bang amqplib la chay that

const publishEvent = (eventName, data) => {
  console.log('📨 [RabbitMQ EVENT PUBLISHED]');
  console.log('   Event:', eventName);
  console.log('   Data:', JSON.stringify(data));
  console.log('----------------------------------------');
};

module.exports = { publishEvent };