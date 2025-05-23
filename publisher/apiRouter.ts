import { StreetsService } from "./israeliStreets";
import amqplib from 'amqplib';
import { Router, Request, Response, RequestHandler } from "express";

const router = Router();

// Publish streets data to RabbitMQ
router.post('/publish',  async (req: Request, res: Response) => {
  console.log('publish req body:', req.body)
  const { city } = req.body;
  if (!city) {
    res.status(400).send({ error: 'City name is required' });
    return
  }
  try {
    const cityStreets = await StreetsService.getStreetsInCity(city);
    const streets = cityStreets.streets;
    if (!streets || streets.length === 0) {
      res.status(404).send({ message: `No streets found for city: ${city}` });
    }

    const connection = await amqplib.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('streets_queue', { durable: true });

    for (const street of streets) {
      channel.sendToQueue('streets_queue', Buffer.from(JSON.stringify(street)));
    }

    await channel.close();
    await connection.close();

     res.status(200).send({ message: `Published ${streets.length} streets for city: ${city}` });
  } catch (error) {
    console.error('Error publishing streets:', error);
     res.status(500).send({ error: 'Internal server error' });
  }
});


export { router }