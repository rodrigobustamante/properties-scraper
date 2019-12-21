import portalInmobiliario from './spiders/portal-inmobiliario';
import mongo from './services/mongo';

(async (): Promise <void> => {
  try {
    await mongo();
    await portalInmobiliario();
  } catch (error) {
    throw new Error(error.message);
  }
})();
