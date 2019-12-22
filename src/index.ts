import portalInmobiliario from './spiders/portal-inmobiliario';
import { connectToDB, disconnectFromDB } from './services/mongo';

(async (): Promise <void> => {
  try {
    await connectToDB();
    await portalInmobiliario();
    await disconnectFromDB();
  } catch (error) {
    throw new Error(error.message);
  }
})();
