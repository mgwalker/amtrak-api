import { parse } from "./crypto.js";

export const getStations = async () => {
  const rawData = await fetch(
    "https://maps.amtrak.com/services/MapDataService/stations/trainStations",
  ).then((response) => response.text());

  const stations = parse(rawData).StationsDataResponse.features.map(
    ({ properties: station }) => {
      return {
        code: station.Code,
        name: station.StationName,
        address1: station.Address1,
        address2: station.Address2,
        city: station.City,
        state: station.State,
        zip: station.Zipcode,
      };
    },
  );
  return stations;
};
