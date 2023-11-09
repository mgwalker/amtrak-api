import { parse } from "./crypto.js";
import { parseRouteStation } from "./routeStation.js";

export const getTrains = async (
  allStationMetadata,
  { fetch = global.fetch, cryptoParse = parse } = {},
) => {
  // Fetch the train data. This is an encrypted blob.
  const rawData = await fetch(
    "https://maps.amtrak.com/services/MapDataService/trains/getTrainsData",
  ).then((response) => response.text());

  // Decrypt all in one swoop.
  const trains = await cryptoParse(rawData);

  // Now clean up the train data.
  return (
    trains.features
      .map(({ properties: train }) => {
        // The train has a bunch of properties Station1 through Station41. If a
        // train visits fewer stations, the remainder are just null. It seems
        // fragile to just assume there will always be the same number of these
        // properties, so instead, find all property keys that match, filter out the
        // ones with no data, and sort by number. Now they're in visit order.
        // Good work, team!
        const stations = Object.keys(train)
          .filter((key) => /^Station\d{1,2}$/.test(key))
          .filter((key) => !!train[key])
          .sort((a, b) => {
            const numA = +a.replace(/\D/g, "");
            const numB = +b.replace(/\D/g, "");
            return numA - numB;
          })
          // Now we can clean up the information for each station, too.
          .map((stationKey, stationNumber) => {
            // So the station metadata is string-encoded JSON. Which I guess means
            // it was double encoded, since the containing object was also string-
            // encoded JSON. Shrugging-person-made-of-symbols.
            const stationData = JSON.parse(train[stationKey]);
            return {
              // This function takes care of figuring out whether the train is
              // scheduled, arrived, enroute, or departed. It also turns all the
              // timestamps into proper ISO8601 UTC timestamps, from what the API
              // provides (local timestamps, but not quite ISO8601, and with the
              // timezone provided as a single letter).
              //
              // This function needs to know if this is the first station in the
              // list because the first station is handled a little differently from
              // the rest. So that's the second argument.
              ...parseRouteStation(stationData, stationNumber === 0),

              // From the list of all stations provided, we can find this station
              // and add its metadata too.
              station: allStationMetadata.find(
                (value) => value.code === stationData.code,
              ),

              // And finally, keep the raw data.
              _raw: stationData,
            };
          })
          // And clear out this CBN station. No idea what it is, but there's no
          // associated CBN station metadata, and I believe I saw this somewhere on
          // the Amtrak site as well.
          .filter(({ code }) => code !== "CBN");

        // If the first station is scheduled, all stations are scheduled, regardless
        // of the prior logic. So go ahead and fix that up.
        if (stations.length > 0 && stations[0].status === "scheduled") {
          stations.forEach((station) => {
            station.status = "scheduled";
          });
        }

        // If any station is in "arrived" status, then there can't be any enroute
        // stations because the train isn't enroute anywhere.
        if (stations.some(({ status }) => status === "arrived")) {
          stations
            .filter(({ status }) => status === "enroute")
            .forEach((station) => {
              station.status = "scheduled";
            });
        }

        // Also, there is only one enroute station. Any stations downtrack from that
        // are just scheduled.
        const enrouteIndex = stations.findIndex(
          ({ status }) => status === "enroute",
        );
        if (enrouteIndex >= 0) {
          stations.slice(enrouteIndex + 1).forEach((station) => {
            station.status = "scheduled";
          });
        }

        // Now that we've turned all those weird StationDD properties into a single
        // sorted parsed array, we can delete them.
        Object.keys(train)
          .filter((key) => /^Station\d{1,2}$/.test(key))
          .forEach((key) => delete train[key]);

        // And build our cleaned up train object. Also keep the raw data.
        const newTrain = {
          id: train.ID,
          heading: train.Heading,
          number: +train.TrainNum,
          route: train.RouteName,
          stations,
          _raw: train,
        };

        return newTrain;
      })
      // Sometimes there are trains with no stations. This seems to be common when
      // one of the listed trains is predeparture.
      .filter(({ stations }) => stations.length > 0)
  );
};
