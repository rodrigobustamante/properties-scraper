import dotenv from 'dotenv';
import portalInmobiliario from './spiders/portal-inmobiliario';
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

    await Promise.all(communes.map(async commune => {
      await portalInmobiliario(commune);
    }));

    redisClient.quit();
    await disconnectFromDB();
  } catch (error) {
    throw new Error(error.message);
  }
})();
