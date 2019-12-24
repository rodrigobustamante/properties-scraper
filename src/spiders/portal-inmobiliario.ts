import got from 'got';
import {
  NeigborhoodInfo,
  Property
} from '../interfaces/portal-inmobiliario';
import { extractSpecs } from '../utils/helpers';
import findDOMElement from '../utils/cheerio';
import {
  createProperty,
  createNeigborhood,
  createCommune
} from '../utils/mongo';
import { getKey, setKey } from '../utils/redis';

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
      nextPage || `${baseUrl}/arriendo/departamento/1-dormitorio/${slug}`;
    const { body } = await got.get(url);

    const elements = await findDOMElement(
      '.item__info-container',
      body
    ).toArray();

    const properties: Property[] = elements.map(element => {
      const priceSymbol = findDOMElement('.price__symbol', element).text();
      const priceFraction = findDOMElement('.price__fraction', element).text();
      const itemAttrs = findDOMElement('.item__attrs', element).text();
      const { href: link } = findDOMElement(
        '.item__info-title-link',
        element
      ).attr();
      const { size, rooms, bathrooms } = extractSpecs(itemAttrs);

      return {
        size,
        rooms,
        bathrooms,
        price: Number(
          priceFraction
            .split('.')
            .join('')
            .replace(',', '.')
        ),
        priceCurrency: priceSymbol === '$' ? 'CLP' : priceSymbol,
        formattedPrice: `${priceSymbol} ${priceFraction}`,
        description: findDOMElement('.main-title', element).text(),
        link: link.split('#')[0]
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

const saveNeighborhoodInfo = (
  slug: string,
  propertiesIds: string[]
): Promise<string> => {
  return createNeigborhood(slug, propertiesIds);
};

const saveCommuneInfo = (
  name: string,
  neighborhoodsIds: string[]
): Promise<string> => {
  return createCommune(name, neighborhoodsIds);
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

    const neigborhoodIds = await Promise.all(
      scraperInformation.map(async info => {
        const { slug, properties } = info;

        const propertiesIds = await Promise.all(
          properties.map(property => savePropertyInfo(property))
        );

        const neigborhoodId = await saveNeighborhoodInfo(
          slug,
          propertiesIds
        );

        return neigborhoodId;
      })
    );

    await saveCommuneInfo(commune, neigborhoodIds);
    console.log(`Ended the scraping for ${commune}!`);
  } catch (error) {
    console.log({ error });
  }
};
