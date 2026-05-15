const amqp = require('amqplib');

// Mock amqplib before requiring the module
jest.mock('amqplib', () => {
  return {
    connect: jest.fn()
  };
});

describe('joinRequestPublisher', () => {
  let mockChannel;
  let publisher;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(true),
      publish: jest.fn()
    };

    amqp.connect.mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue(mockChannel)
    });

    // We must isolate modules to test the top-level initialization
    jest.isolateModules(() => {
      publisher = require('../publisher/joinRequestPublisher');
    });
    
    // allow event loop to process the connectRabbitMQ promise
    await new Promise(process.nextTick); 
  });

  describe('publishApproved', () => {
    it('should call publish with correct routing key and payload', async () => {
      const payload = { userId: 'u1', tripId: 't1', tripName: 'Trip' };
      await publisher.publishApproved(payload);
      
      expect(mockChannel.publish).toHaveBeenCalledWith(
        'join-request-events',
        'join.approved',
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
    });
  });

  describe('publishRejected', () => {
    it('should call publish with correct routing key and payload', async () => {
      const payload = { userId: 'u1', tripId: 't1', tripName: 'Trip' };
      await publisher.publishRejected(payload);
      
      expect(mockChannel.publish).toHaveBeenCalledWith(
        'join-request-events',
        'join.rejected',
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
    });
  });

  it('should not throw if amqp throws an error', async () => {
    // Override the mock to throw error
    mockChannel.publish.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const payload = { userId: 'u1', tripId: 't1', tripName: 'Trip' };
    // Should not throw
    await expect(publisher.publishApproved(payload)).resolves.not.toThrow();
  });
});
