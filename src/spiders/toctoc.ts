import got from 'got';
import { SearchCommuneResponse, CommuneInfo } from '../interfaces/toctoc';

const baseURL = 'https://www.toctoc.com/api';
const urlMap = {
  getProperties: `${baseURL}/mapa/GetPropiedades2`,
  searchCommuneId: 'https://pautocomplete.toctoc.com/search',
}

const processSearchCommuneResponse = (body: SearchCommuneResponse): CommuneInfo => {
  const { autocompletesuggest } = body.suggest;

  if (!autocompletesuggest.length) return null;

  const [suggestions] = autocompletesuggest;

  if (!suggestions.length) return null;

  const [firstSuggestion] = suggestions.options;

  if(!firstSuggestion) return null;

  const { _id: id, _source } = firstSuggestion;

  if (!_source.suggest.length) return null;

  const { suggest, Texto: label } = _source;
  const { input: name } = suggest[0];

  return {
    id: Number(id),
    name,
    label,
  }
}

const getCommuneId = async (communeName: string): Promise<CommuneInfo> => {
  try {
    const payload = {
      suggest: {
        autocompletesuggest:
        {
          prefix: communeName,
          completion:
          {
            field: 'suggest',
            fuzzy: { fuzziness: 1 }
          }
        }
      }
    }

    const { body } = await got.post(urlMap.searchCommuneId, { json: payload, responseType: 'json' });

    return processSearchCommuneResponse(body);
  } catch (error) {
    throw new Error(error.message);
  }
}

// const processPropertyInfo

export default async (commune: string): Promise<any> => {
  const communeInfo = await getCommuneId(commune);

  if (!communeInfo) return null;

  const { id, name, label } = communeInfo;


  const toctocAccessToken = process.env.TOCTOC_ACCESS_TOKEN;
  const payload = { 'tipoVista': 'lista', 'idPoligono': id, 'moneda': 2, 'tipoPropiedad': 'departamento', 'busqueda': label, 'limite': 10000 };
  const headers = { 'x-access-token': toctocAccessToken, 'Content-Type': 'application/json' };

  try {
    const { body } = await got.post(urlMap.getProperties, { headers, body: JSON.stringify(payload), responseType: 'json' });


    return body.resultados.Propiedades;
  } catch (error) {
    console.log({ error });
    throw new Error(error.message);
  }
};
