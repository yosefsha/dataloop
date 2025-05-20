import axios from "axios";
import { Pool, PoolClient } from "pg";
import * as amqplib from "amqplib";

interface LatLon {
  lat: number;
  lon: number;
}

interface GeoJSONLineString {
  type: "LineString";
  coordinates: [number, number][];
}

export class lineStringDataService {
  private pool: Pool;
  private client!: PoolClient;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
      user: process.env.POSTGRES_USER || "admin",
      password: process.env.POSTGRES_PASSWORD || "admin",
      database: process.env.POSTGRES_DB || "streetsdb",
    });
  }

  private async getStreetLine(street: string, city: string, country: string = "Israel"): Promise<GeoJSONLineString> {
    if (!(street && city)) {
      throw new Error("street and city are required");
    }
    // 1. Geocode with Nominatim
    const nominatimURL = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(
      street
    )}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&format=json&limit=1`;

    const geoRes = await axios.get(nominatimURL, {
      headers: { "User-Agent": "get-street-line-example" },
    });

    const geoData = geoRes.data;
    if (!geoData.length) {
      throw new Error("Street not found");
    }

    const bbox = geoData[0].boundingbox; // [south, north, west, east]
    const [s, n, w, e] = bbox.map(parseFloat);

    // 2. Query Overpass API
    const overpassQuery = `
      [out:json];
      way["name"="${street}"]["highway"](${s},${w},${n},${e});
      out geom;
    `;

    const overpassRes = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "get-street-line-example",
      },
    });
    console.log(overpassRes.headers["content-length"]);

    const overpassData = overpassRes.data;

    if (!overpassData.elements || !overpassData.elements.length) {
      throw new Error("No street geometry found in Overpass");
    }

    const lineStrings: GeoJSONLineString = overpassData.elements
      .filter((el: any) => el.type === "way" && el.geometry)
      .map((el: any) => ({
        type: "LineString",
        coordinates: el.geometry.map((pt: LatLon) => [pt.lon, pt.lat]),
      }))[0];

    return lineStrings;
  }

  public async insertLineStringData(line: GeoJSONLineString, street: string, city: string) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const coords = line.coordinates.map(([lon, lat]) => `${lon} ${lat}`).join(", ");

      const linestringWKT = `LINESTRING(${coords})`;

      await client.query("INSERT INTO line_strings (street, city, geom) VALUES ($1, $2, ST_GeomFromText($3, 4326))", [
        street,
        city,
        linestringWKT,
      ]);

      await client.query("COMMIT");
      console.log(`Inserted LineString into PostgreSQL`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Error inserting LineStrings: ${err}`);
    } finally {
      client.release();
    }
  }

  private extractCityAndStreetFromMessage(msg: amqplib.ConsumeMessage) {
    const strMessage = msg.content.toString();
    console.info("Received street message raw:", strMessage);
    const { street_id, street_name, street_english_name, street_hebrew_name, region_name, city_name } =
      JSON.parse(strMessage);
    return {
      street_id,
      street_name,
      street_english_name,
      street_hebrew_name,
      region_name,
      city_name,
    };
  }

  private consumeQueueAndUpdate = async (channel: amqplib.Channel, queue: string) => {
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in queue: ${queue}`);
    channel.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
      if (msg) {
        try {
          const strMessage = msg.content.toString();
          console.info("Received street message raw:", strMessage);
          const { city_name, street_english_name } = JSON.parse(strMessage);
          console.info(`will get line string for ${street_english_name} in ${city_name}`);
          const line = await this.getStreetLine(street_english_name, city_name);
          console.info(`Did get line for ${street_english_name} in ${city_name}`);
          this.insertLineStringData(line!, street_english_name, city_name);
          console.info(`Inserted data of ${street_english_name} to pg`);
        } catch (error) {
          console.error("Error processing message:", error);
        } finally {
          console.debug("Acknowledging message");
          channel.ack(msg);
        }
      }
    });
  };

  public async consumeAndUpdate() {
    const rabbitMqUri = process.env.RABBITMQ_URI || "amqp://rabbitmq";
    const connection = await this.connectToRabbitMQ(rabbitMqUri);
    const channel = await connection.createChannel();
    this.consumeQueueAndUpdate(channel, "streets_queue");
  }

  private connectToRabbitMQ = async (uri: string, retries = 5, delay = 5000) => {
    while (retries > 0) {
      try {
        const connection = await amqplib.connect(uri);
        console.log("Connected to RabbitMQ");
        return connection;
      } catch (error) {
        console.error(`Failed to connect to RabbitMQ. Retries left: ${retries - 1}`, error);
        retries -= 1;
        if (retries === 0) throw new Error("Could not connect to RabbitMQ after multiple retries");
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Exhausted retries for RabbitMQ connection");
  };
}
