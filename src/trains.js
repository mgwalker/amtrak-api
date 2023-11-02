import { parse } from "./crypto.js";
import { parseRouteStation } from "./routeStation.js";

export const getTrains = async (allStationMetadata = []) => {
  const rawData = await fetch(
    "https://maps.amtrak.com/services/MapDataService/trains/getTrainsData",
  ).then((response) => response.text());

  const e = 0;

  const trains = parse(rawData).features.map(({ properties: train }) => {
    const stations = Object.keys(train)
      .filter((key) => /^Station\d{1,2}$/.test(key))
      .filter((key) => !!train[key])
      .sort((a, b) => {
        const numA = +a.replace(/\D/g, "");
        const numB = +b.replace(/\D/g, "");
        return numA - numB;
      })
      .map((stationKey, stationNumber) => {
        // So the station metadata is string-encoded JSON. Which I guess means
        // it was double encoded, since the containing object was also string-
        // encoded JSON. Shrugging-person-made-of-symbols.
        const stationData = JSON.parse(train[stationKey]);
        return {
          ...parseRouteStation(stationData, stationNumber === 0),
          station: allStationMetadata.find(
            (value) => value.code === stationData.code,
          ),
        };
      });

    Object.keys(train)
      .filter((key) => /^Station\d{1,2}$/.test(key))
      .forEach((key) => delete train[key]);

    const newTrain = {
      heading: train.Heading,
      number: +train.TrainNum,
      route: train.RouteName,
      stations,
    };

    return newTrain;
  });

  return trains;
};
