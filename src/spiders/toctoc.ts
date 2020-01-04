import got from 'got';
import { SearchCommuneResponse, CommuneInfo, Property } from '../interfaces/toctoc';
import { createProperty, createCommune } from '../utils/mongo';

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

  if (!firstSuggestion) return null;

  const { _source } = firstSuggestion;

  if (!_source.suggest.length) return null;

  const { suggest, Texto: label, IdInterno: id } = _source;
  const { input: name } = suggest[0];

  return {
    id,
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

const processPropertyInfo = (dataToTransform: Array<any>): Property => (
  {
    size: dataToTransform[34],
    description: dataToTransform[39],
    price: dataToTransform[22],
    link: dataToTransform[40],
    bathrooms: dataToTransform[4],
    rooms: dataToTransform[8],
    portal: 'TocToc',
  }
);

const savePropertyInfo = (property: Property): Promise<string> => {
  return createProperty(property);
};

const saveCommuneInfo = (
  name: string,
  portal: string,
  propertiesIds: string[]
): Promise<string> => {
  return createCommune(name, propertiesIds);
};

export default async (commune: string): Promise<void> => {
  console.log(`Started the scraping for ${commune} in TocToc!`);
  const communeInfo = await getCommuneId(commune);

  if (!communeInfo) return null;

  const { id, name, label } = communeInfo;

  const toctocAccessToken = process.env.TOCTOC_ACCESS_TOKEN;
  const payload = { 'tipoVista': 'lista', 'idPoligono': id, 'moneda': 2, 'operacion': 2, 'tipoPropiedad': 'departamento', 'busqueda': label, 'limite': 10000 };
  const headers = { 'x-access-token': toctocAccessToken, 'Content-Type': 'application/json' };

  try {
    const { body } = await got.post(urlMap.getProperties, { headers, body: JSON.stringify(payload), responseType: 'json' });
    const { Propiedades: properties } = body.resultados;

    const hydratedProperties = properties.map(property => processPropertyInfo(property));
    const propertiesIds: string[] = await Promise.all(hydratedProperties.map(
      (property: Property) => savePropertyInfo(property)
    ));

    await saveCommuneInfo(name, 'TocToc', propertiesIds);
    console.log(`Ended the scraping for ${commune} in TocToc!`);
  } catch (error) {
    throw new Error(error.message);
  }
};
