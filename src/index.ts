import dotenv from 'dotenv';
import portalInmobiliario from './spiders/portal-inmobiliario';
import toctoc from './spiders/toctoc';
import { connectToDB, disconnectFromDB } from './services/mongo';
import redisClient from './services/redis';
import { splitSeparatedFields } from './utils/helpers';

dotenv.config();

(async (): Promise<void> => {
  const communes = splitSeparatedFields(process.env.COMMUNES);

  if (!communes) {
    return;
  }

  try {
    await connectToDB();
    await redisClient.connect();

    await Promise.all(communes.map(async commune => {
      await portalInmobiliario(commune);
      await toctoc(commune);
    }));

    await disconnectFromDB();
    await redisClient.quit();
  } catch (error) {
    throw new Error(error.message);
  }
})();
