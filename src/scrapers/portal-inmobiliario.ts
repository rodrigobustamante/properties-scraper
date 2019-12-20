import axios from 'axios';
import fs from 'fs';
import { NeigborhoodUrl, NeigborhoodInfo } from './portal-inmobiliario.d';
import extractDataFromInnerText from '../utils/helpers';
import findDOMElement from '../utils/cheerio';

// TODO: transform in env variable
const baseUrl = 'https://www.portalinmobiliario.com';
// searchTerm should be defined on index file??
const searchTerm = 'Providencia';

const urlMap = {
  searchLocations: '/api/search-faceted/MLC/locations?query=',
  // TODO: Pass values to operation_id and only_news options.
  getLocationUrl:
    '/api/search-faceted/MLC/search-real-estate-url?operation_id=arriendo_departamento&only_news=false&location_id='
};

const getNeighborhoodUrl = async (
  neighborhoodId: string
): Promise<NeigborhoodUrl[]> => {
  const { data: url } = await axios.get(
    `${baseUrl}${urlMap.getLocationUrl}${neighborhoodId}`
  );

  return url;
};

const getNeighborhoodsSlug = (neigborhoodsUrl: NeigborhoodUrl[]): string[] => {
  return neigborhoodsUrl.map(({ url }) =>
    url.substring(url.lastIndexOf('/') + 1)
  );
};

const scrapNeighborhood = async (neighborhoodSlug: string): Promise<NeigborhoodInfo> => {
  // TODO: Change this parameters to optiosn setted outside of this function.
  const url = `${baseUrl}/arriendo/departamento/1-dormitorio/${neighborhoodSlug}`;
  const { data: body } = await axios.get(url);

  const elements = await findDOMElement('.item__info-container', body).toArray();

  const neighborhoodData = elements.map(element => {
    const priceSymbol = findDOMElement('.price__symbol', element).text();
    const priceFraction = findDOMElement('.price__fraction', element).text();
    const itemAttrs = findDOMElement('.item__attrs', element).text();
    const { href: link } = findDOMElement('.item__info-title-link', element).attr();
    const { size, rooms, bathrooms } = extractDataFromInnerText(itemAttrs);

    return {
      size,
      rooms,
      bathrooms,
      price: Number(priceFraction.split('.').join('')),
      priceCurrency: priceSymbol === '$' ? 'CLP' : priceSymbol,
      formattedPrice: `${priceSymbol} ${priceFraction}`,
      description: findDOMElement('.main-title', element).text(),
      link,
    }
  });

  return {
    neighborhoodSlug,
    neighborhoodData,
  }
};

export default async (): Promise<void> => {
  try {
    console.log(`Scraping info for ${searchTerm}`);
    const url = `${baseUrl}${urlMap.searchLocations}${searchTerm}`;
    const { data } = await axios.get(url);

    const extractedNeighborhoods = data.filter(
      (d: { level: string; }) => d.level === 'neighborhood'
    );

    const neighborhoodURLs = await Promise.all(
      extractedNeighborhoods.map((neighborhood: { id: string; }) =>
        getNeighborhoodUrl(neighborhood.id)
      )
    );

    const neighborhoodSlugs = getNeighborhoodsSlug(neighborhoodURLs);

    const scraperInformation = await Promise.all(
      neighborhoodSlugs.map(slug => scrapNeighborhood(slug))
    );

    const scraperInfoInString = JSON.stringify(scraperInformation);
    fs.writeFileSync(`./output/${searchTerm}.json`, scraperInfoInString);

    console.log(`Ended!`);
  } catch (error) {
    console.log({ error });
  }
};
