import puppeteer from "puppeteer";
import got from "got";
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
  const { body: url } = await got(
    `${baseUrl}${urlMap.getLocationUrl}${neighborhoodId}`
  );

  return JSON.parse(url);
};

const getNeighborhoodsSlug = (neigborhoodsUrl: NeigborhoodUrl[]) => {
  return neigborhoodsUrl.map(({ url }) =>
    url.substring(url.lastIndexOf("/") + 1)
  );
};

const scrapNeighborhood = async (neighborhoodSlug: string) => {
  const url = `${baseUrl}/arriendo/departamento/1-dormitorio/${neighborhoodSlug}`;
  
  console.log(url);
};

export default async () => {
  try {
    const url = `${baseUrl}${urlMap.searchLocations}${searchTerm}`;
    const { body } = await got(url);

    const formattedBody = JSON.parse(body);
    const extractedNeighborhoods = formattedBody.filter(
      data => data.level === "neighborhood"
    );

    const neighborhoodURLs = await Promise.all(
      extractedNeighborhoods.map(neighborhood =>
        getNeighborhoodUrl(neighborhood.id)
      )
    );

    const neighborhoodSlugs = getNeighborhoodsSlug(neighborhoodURLs);

    await Promise.all(
      neighborhoodSlugs.map(slug => scrapNeighborhood(slug))
    );
  } catch (error) {
    console.log({ error });
  }
};
