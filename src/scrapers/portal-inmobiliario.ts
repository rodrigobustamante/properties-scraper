import puppeteer from "puppeteer";
import axios from 'axios';
import fs from 'fs';
import { NeigborhoodUrl } from "./portal-inmobiliario.d";
import { extractDataFromInnerText } from "../utils/helpers";

// TODO: transform in env variable
const baseUrl = "https://www.portalinmobiliario.com";
// searchTerm should be defined on index file??
const searchTerm = "Providencia";

const urlMap = {
  searchLocations: "/api/search-faceted/MLC/locations?query=",
  // TODO: Pass values to operation_id and only_news options.
  getLocationUrl:
    "/api/search-faceted/MLC/search-real-estate-url?operation_id=arriendo_departamento&only_news=false&location_id="
};

const getNeighborhoodUrl = async (
  neighborhoodId: string
): Promise<NeigborhoodUrl[]> => {
  const { data: url } = await axios.get(
    `${baseUrl}${urlMap.getLocationUrl}${neighborhoodId}`
  );

  return url;
};

const getNeighborhoodsSlug = (neigborhoodsUrl: NeigborhoodUrl[]) => {
  return neigborhoodsUrl.map(({ url }) =>
    url.substring(url.lastIndexOf("/") + 1)
  );
};

const scrapNeighborhood = async (neighborhoodSlug: string) => {
  // TODO: Change this parameters to optiosn setted outside of this function.
  const url = `${baseUrl}/arriendo/departamento/1-dormitorio/${neighborhoodSlug}`;
  const browser = await puppeteer.launch();
  
  try {
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('#searchResults', {visible: true, timeout: 5000 });

    const rows = await page.$$('.item__info-container');

    const neighborhoodInfo = [];

    for (const row of rows) {
      const rowLinkElement = await row.$('a');
      const href = await page.evaluate(el => el.href, rowLinkElement);
      const innerText = await page.evaluate(el => el.innerText, row);

      const rowInfo = {
        ...extractDataFromInnerText(innerText), 
        href
      };

      neighborhoodInfo.push(rowInfo);
    }

    await browser.close();

    return { [neighborhoodSlug]: neighborhoodInfo };
  } catch (error) {
    console.log({error});
    
    await browser.close();
  }
};

export default async () => {
  try {
    console.log(`Scraping info for ${searchTerm}`);
    const url = `${baseUrl}${urlMap.searchLocations}${searchTerm}`;
    const { data } = await axios.get(url);

    const extractedNeighborhoods = data.filter(
      data => data.level === "neighborhood"
    );

    const neighborhoodURLs = await Promise.all(
      extractedNeighborhoods.map(neighborhood =>
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
