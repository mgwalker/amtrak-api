import { parse } from "./crypto.js";

export const getStations = async ({
  cryptoParse = parse,
  fetch = global.fetch,
} = {}) => {
  // Fetch the raw data.
  const rawData = await fetch(
    "https://maps.amtrak.com/services/MapDataService/stations/trainStations",
  ).then((response) => response.text());

  // Decrypt it.
  const stations = await cryptoParse(rawData);

  // Sometimes Amtrak tells the GitHub action that it's not allowed to access
  // the site. Perhaps they're shutting this API down because they're not happy
  // that someone has made their data accessible since they're not willing to
  // do it, despite being publicly funded.
  if (stations?.StationsDataResponse?.error) {
    console.log(stations.StationsDataResponse.error.message);
    return [];
  }

  // Map it into a little bit cleaner structure, and keep the original raw data
  return stations?.StationsDataResponse?.features?.map(
    ({ properties: station }) => ({
      code: station.Code,
      name: station.StationName,
      address1: station.Address1,
      address2: station.Address2,
      city: station.City,
      state: station.State,
      lat: station.lat,
      lon: station.lon,
      zip: station.Zipcode,
      _raw: station,
    }),
  );
};
