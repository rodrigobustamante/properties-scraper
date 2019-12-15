import puppeteer from "puppeteer";
import axios from 'axios';
import { NeigborhoodUrl } from "./portal-inmobiliario.d";

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

    const rows = await page.$$('li.results-item');

    await browser.close();
  } catch (error) {
    console.log({error});
    
    await browser.close();
  }

  console.log(url);
};

export default async () => {
  try {
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

    // await Promise.all(
    //   neighborhoodSlugs.map(slug => scrapNeighborhood(slug))
    // );

    // TODO: Test purpose
    scrapNeighborhood(neighborhoodSlugs[0]);
  } catch (error) {
    console.log({ error });
  }
};
