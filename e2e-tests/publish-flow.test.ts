import axios from 'axios';
import { MongoClient } from 'mongodb';

const baseURL = 'http://localhost:3000';
const mongoUri = 'mongodb://localhost:27017';
const dbName = 'streets';
jest.setTimeout(30000); // 30 seconds

describe('E2E: Publish flow', () => {
    let mongoClient: MongoClient;

    beforeAll(async () => {
        // Initialize MongoDB connection
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
    });

    afterAll(async () => {
        // Close MongoDB connection
        if (mongoClient) {
            await mongoClient.close();
        }
    });


    it('should publish streets and persist them in MongoDB', async () => {

    const city = 'Galgal';
    const response = await axios.post(`${baseURL}/publish`, { city });
    expect(response.status).toBe(200);
    expect(response.data.message).toMatch(/published/i);

    // Give the consumer some time to persist the message
    await new Promise(res => setTimeout(res, 4000));

    const db = mongoClient.db(dbName);
    const collection = db.collection('streets');
    
    const streets = await collection.find({ streetId: 115541 }).toArray();

    expect(streets.length).toBeGreaterThan(0);
    });
});
