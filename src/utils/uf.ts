import got from 'got';
import { getKey, setKey } from './redis';

const transformUFToCLP = async (value: number): Promise<number> => {
  const { SBIF_API_KEY } = process.env;
  let UFValue = await getKey('UF');

  if (!UFValue) {
    const { body } = await got
      .get(`https://api.sbif.cl/api-sbifv3/recursos_api/uf?apikey=${SBIF_API_KEY}&formato=json`,
        { responseType: 'json' });

    UFValue = body.UFs[0].Valor.replace('.', '').replace(',', '.');
    await setKey('UF', UFValue.toString(), 43200);
  }

  return value * Math.round(Number(UFValue));
}

export default transformUFToCLP;
