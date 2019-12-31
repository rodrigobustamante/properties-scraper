import got from 'got';
import { flattenDeep } from 'lodash';
import {
  NeigborhoodInfo,
  Property
} from '../interfaces/portal-inmobiliario';
import { extractSpecs } from '../utils/helpers';
import findDOMElement from '../utils/cheerio';
import {
  createProperty,
  createCommune
} from '../utils/mongo';
import { getKey, setKey } from '../utils/redis';
import transformUFToCLP from '../utils/uf';

const baseUrl = 'https://www.portalinmobiliario.com';
const urlMap = {
  searchLocations: '/api/search-faceted/MLC/locations?query=',
  // TODO: Pass values to operation_id and only_news options.
  getLocationUrl:
    '/api/search-faceted/MLC/search-real-estate-url?operation_id=arriendo_departamento&only_news=false&location_id='
};

const getNeighborhoodUrl = async (
  neighborhoodId: string
): Promise<string> => {
  const neigborhoodUrl = await getKey(neighborhoodId);

  if (!neigborhoodUrl) {
    const {
      body
    } = await got.get(`${baseUrl}${urlMap.getLocationUrl}${neighborhoodId}`, {
      responseType: 'json'
    });

    await setKey(neighborhoodId, body.url);

    return body.url;
  }

  return neigborhoodUrl;
};

const getNeighborhoodsSlug = (neigborhoodsUrl: string[]): string[] => {
  return neigborhoodsUrl.map((url) =>
    url.substring(url.lastIndexOf('/') + 1)
  );
};

const scrapNeighborhood = async (
  slug: string,
  nextPage?: string
): Promise<NeigborhoodInfo> => {
  try {
    const url =
      nextPage || `${baseUrl}/arriendo/departamento/${slug}`;
    const { body } = await got.get(url);

    const elements = await findDOMElement(
      '.item__info-container',
      body
    ).toArray();

    const properties: Property[] = elements.map(element => {
      const priceSymbol = findDOMElement('.price__symbol', element).text();
      const priceFraction = findDOMElement('.price__fraction', element).text()
        || findDOMElement('.price__clf-full', element).text();

      const itemAttrs = findDOMElement('.item__attrs', element).text();
      const { size, rooms, bathrooms } = extractSpecs(itemAttrs);
      const priceToNumber = Number(priceFraction.split('.').join('').replace(',', '.'));
      const { href } = findDOMElement(
        '.item__info-title-link',
        element
      ).attr();

      return {
        size,
        rooms,
        bathrooms,
        price: priceToNumber,
        priceCurrency: priceSymbol === '$' ? 'CLP' : priceSymbol,
        description: findDOMElement('.main-title', element).text(),
        link: href.split('#')[0]
      };
    });

    try {
      const { href } = await findDOMElement('.prefetch', body).attr();
      const { properties: nextPageData } = await scrapNeighborhood(slug, href);

      return {
        slug,
        properties: [...properties, ...nextPageData]
      };
    } catch (error) {
      return {
        slug,
        properties
      };
    }
  } catch (error) {
    return {
      slug,
      properties: [],
    }
  }
};

const savePropertyInfo = (property: Property): Promise<string> => {
  return createProperty(property);
};

const saveCommuneInfo = (
  name: string,
  portal: string,
  propertiesIds: string[]
): Promise<string> => {
  return createCommune(name, portal, propertiesIds);
};

export default async (commune: string): Promise<void> => {
  try {
    console.log(`Scraping info for ${commune}`);

    const url = `${baseUrl}${urlMap.searchLocations}${encodeURI(commune)}`;
    const { body } = await got.get(url, { responseType: 'json' });

    const extractedNeighborhoods = body.filter(
      (d: { level: string }) => d.level === 'neighborhood'
    );

    const neighborhoodURLs: string[] = await Promise.all(
      extractedNeighborhoods.map((neighborhood: { id: string }) =>
        getNeighborhoodUrl(neighborhood.id)
      )
    );

    const neighborhoodSlugs = getNeighborhoodsSlug(neighborhoodURLs);

    const scraperInformation = await Promise.all(
      neighborhoodSlugs.map(slug => scrapNeighborhood(slug))
    );

    const propertiesIds = await Promise.all(
      scraperInformation.map(async info => {
        const { properties } = info;

        const pIds = await Promise.all(
          properties.map(async property => {
            if (property.priceCurrency !== 'UF') {
              return savePropertyInfo(property);
            }

            const p = {...property, price: (await transformUFToCLP(property.price))}
            return savePropertyInfo(p);
          }),
        );

        return pIds;
      }),
    );

    const flattedPropertiesIds: string[] = flattenDeep(propertiesIds);
    await saveCommuneInfo(commune, 'PortalInmobiliario', flattedPropertiesIds);
    console.log(`Ended the scraping for ${commune}!`);
  } catch (error) {
    console.log({ error });
  }
};
