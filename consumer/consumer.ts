import * as amqplib from 'amqplib';
import mongoose from 'mongoose';

// MongoDB connection
const connectToMongo = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/streets';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
};

// MongoDB schema and model
const streetSchema = new mongoose.Schema(
  {
    street_id: { type: Number, unique: true },
    street_name: String,
  },
  { timestamps: true }
);
const Street = mongoose.model('Street', streetSchema);

// Retry logic for RabbitMQ connection
const connectToRabbitMQ = async (uri: string, retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      const connection = await amqplib.connect(uri);
      console.log('Connected to RabbitMQ');
      return connection;
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ. Retries left: ${retries - 1}`, error);
      retries -= 1;
      if (retries === 0) throw new Error('Could not connect to RabbitMQ after multiple retries');
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Exhausted retries for RabbitMQ connection');
};

// RabbitMQ consumer logic
const consumeFromQueue = async (channel: amqplib.Channel, queue: string) => {
  await channel.assertQueue(queue, { durable: true });

  console.log(`Waiting for messages in queue: ${queue}`);
  interface StreetData {
    street_id: number;
    street_name: string;
  }

  channel.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
    if (msg) {
      console.log('Received message raw:',msg.content.toString())
      const streetData: StreetData = JSON.parse(msg.content.toString());
      console.log('Received message:', streetData);

      // Save to MongoDB
      const street = new Street(streetData);
      await street.save();
      console.log('Saved to MongoDB:', street.toObject());
      console.log('Saved to MongoDB json:', JSON.stringify(street.toObject(), null, 2));

      channel.ack(msg);
    }
  });
};

// Main function
const main = async () => {
  try {
    await connectToMongo();
    const rabbitMqUri = process.env.RABBITMQ_URI || 'amqp://rabbitmq';
    const connection = await connectToRabbitMQ(rabbitMqUri);
    const channel = await connection.createChannel();
    await consumeFromQueue(channel, 'streets_queue');
  } catch (error) {
    console.error('Error in consuming service:', error);

  }
};

main();